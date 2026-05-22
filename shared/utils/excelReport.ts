import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format, endOfWeek, addDays, isWithinInterval, eachWeekOfInterval, isSameDay } from 'date-fns';

interface Task {
  id: string;
  name: string;
  project: string;
  priority: number | null;
  status: string;
  start_date: number | null;
  due_date_raw: number | null;
  date_closed?: string | null;
  text_content?: string;
  assignee?: { name: string };
  flags: {
    isSpillover: boolean;
    isBlocked?: boolean;
    isOverdue?: boolean;
  };
}

// Dynamic Canvas-based Clustered Bar Chart Renderer
function drawClusteredBarChart(
  tasks: Task[], 
  periodName: string, 
  groupBy: 'assignee' | 'project'
): string {
  // 1. Group tasks and aggregate metrics
  const groupsMap: { [key: string]: { open: number; completed: number; blocked: number; spillover: number } } = {};
  
  tasks.forEach(task => {
    const key = groupBy === 'assignee' 
      ? (task.assignee?.name || 'Unassigned') 
      : task.project;
      
    if (!groupsMap[key]) {
      groupsMap[key] = { open: 0, completed: 0, blocked: 0, spillover: 0 };
    }
    
    const isDone = task.status.toLowerCase().includes('complete') || task.status.toLowerCase().includes('done') || task.status.toLowerCase().includes('closed');
    if (isDone) {
      groupsMap[key].completed++;
    } else {
      groupsMap[key].open++;
    }
    
    if (task.flags?.isBlocked) {
      groupsMap[key].blocked++;
    }
    if (task.flags?.isSpillover) {
      groupsMap[key].spillover++;
    }
  });

  const groups = Object.entries(groupsMap)
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => (b.open + b.completed) - (a.open + a.completed))
    .slice(0, 10); // Limit to top 10 for best visual layout

  if (groups.length === 0) {
    // Return empty image if no groups exist
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = 100;
    emptyCanvas.height = 100;
    return emptyCanvas.toDataURL('image/png');
  }

  // 2. Set dimensions with extra horizontal room for groups
  const width = Math.max(900, groups.length * 100 + 150);
  const height = 500;
  
  const canvas = document.createElement('canvas');
  // Scale for high resolution Retina displays (2x)
  canvas.width = width * 2;
  canvas.height = height * 2;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // 3. Paint dark slate theme background
  ctx.fillStyle = '#1E293B'; // Slate-800
  ctx.fillRect(0, 0, width, height);

  // 4. Draw Header Title
  ctx.fillStyle = '#F8FAFC'; // Slate-50
  ctx.font = 'bold 18px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    groupBy === 'assignee' 
      ? `Task Workload by Assignee — ${periodName}`
      : `Project Delivery & Health Summary — ${periodName}`,
    40, 
    42
  );

  // 5. Draw Legend Group
  const legendX = width - 420;
  const legendY = 28;
  const legendItems = [
    { label: 'Active / Open', color: '#3B82F6' },
    { label: 'Completed', color: '#22C55E' },
    { label: 'Blocked', color: '#EF4444' },
    { label: 'Spillover', color: '#F97316' }
  ];
  legendItems.forEach((item, index) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX + index * 100, legendY, 15, 15);
    ctx.fillStyle = '#94A3B8'; // Slate-400
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(item.label, legendX + index * 100 + 20, legendY + 12);
  });

  // 6. Chart boundaries
  const chartLeft = 60;
  const chartRight = width - 40;
  const chartTop = 80;
  const chartBottom = height - 120;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  // 7. Calculate max Y tick value
  let maxVal = 0;
  groups.forEach(g => {
    maxVal = Math.max(maxVal, g.open, g.completed, g.blocked, g.spillover);
  });
  maxVal = Math.max(5, Math.ceil(maxVal * 1.25)); // 25% padding on top

  // 8. Draw Y Gridlines & Y Labels
  const yTicks = 5;
  ctx.strokeStyle = '#334155'; // Slate-700
  ctx.lineWidth = 1;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px Inter, sans-serif';

  for (let i = 0; i <= yTicks; i++) {
    const y = chartBottom - (i / yTicks) * chartHeight;
    const val = Math.round((i / yTicks) * maxVal);

    // Faint gridline
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartRight, y);
    ctx.stroke();

    // Tick Label
    ctx.fillText(String(val), chartLeft - 10, y + 4);
  }

  // 9. Draw Groups & Clustered vertical bars
  const groupCount = groups.length;
  const groupWidth = chartWidth / groupCount;
  const innerPadding = 12; // margins inside group
  const barWidth = (groupWidth - innerPadding * 2) / 4; // 4 metrics

  groups.forEach((g, gIdx) => {
    const groupX = chartLeft + gIdx * groupWidth + innerPadding;

    const metrics = [
      { val: g.open, color: '#3B82F6' },
      { val: g.completed, color: '#22C55E' },
      { val: g.blocked, color: '#EF4444' },
      { val: g.spillover, color: '#F97316' }
    ];

    metrics.forEach((m, mIdx) => {
      const barH = (m.val / maxVal) * chartHeight;
      const barX = groupX + mIdx * barWidth;
      const barY = chartBottom - barH;

      if (m.val > 0) {
        // Draw the vertical bar
        ctx.fillStyle = m.color;
        ctx.fillRect(barX, barY, barWidth - 2, barH);

        // Draw dynamic numeric label above bar
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(m.val), barX + (barWidth - 2) / 2, barY - 4);
      }
    });

    // 10. Draw X Axis Group labels rotated by -35deg to guarantee no overlap
    ctx.save();
    ctx.translate(groupX + (groupWidth - innerPadding * 2) / 2, chartBottom + 16);
    ctx.rotate(-35 * Math.PI / 180);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(g.name, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL('image/png');
}

export async function generateStyledReport(
  tasks: Task[], 
  type: 'weekly' | 'monthly' | 'quarterly', 
  periodName: string, 
  periodStartDate: Date,
  periodEndDate: Date,
  showAssignee: boolean = true,
  groupBy: 'assignee' | 'project' = 'assignee'
) {
  const workbook = new ExcelJS.Workbook();
  
  const intervals = type === 'weekly' 
    ? eachWeekOfInterval({ start: periodStartDate, end: periodEndDate })
    : [periodStartDate];

  // Pre-generate dynamic canvas chart to embed below worksheet
  let chartBase64: string | null = null;
  try {
    chartBase64 = drawClusteredBarChart(tasks, periodName, groupBy);
  } catch (err) {
    console.error('Failed to pre-render dynamic Excel chart:', err);
  }

  intervals.forEach((intervalStart, index) => {
    const sheetName = type === 'weekly' ? `Week ${index + 1}` : periodName.substring(0, 30);
    const worksheet = workbook.addWorksheet(sheetName);
    
    const weekEnd = type === 'weekly' ? endOfWeek(intervalStart) : periodEndDate;
    const dateRangeStr = `${format(intervalStart, 'dd MMM')} – ${format(weekEnd, 'dd MMM yyyy')}`;

    // 1. TOP HEADER
    const headerRow = worksheet.getRow(1);
    headerRow.height = 40;
    worksheet.mergeCells('A1:L1');
    const headerCell = worksheet.getCell('A1');
    headerCell.value = `TM labs | ${type.toUpperCase()} TASK TRACKER ${format(periodStartDate, 'yyyy')}`;
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10024F' } };
    headerCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 16 };
    headerCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 2. PERIOD BAR
    const periodRow = worksheet.getRow(2);
    periodRow.height = 30;
    worksheet.mergeCells('A2:L2');
    const periodCell = worksheet.getCell('A2');
    periodCell.value = `  ${type === 'weekly' ? `WEEK ${index + 1}` : periodName} | ${dateRangeStr}`;
    periodCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF3396' } };
    periodCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
    periodCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // 3. COLUMN HEADERS
    const baseHeaders = ['#', 'Task Title', 'Category', 'Priority'];
    if (showAssignee) baseHeaders.push('Assignee');
    const colHeaders = [...baseHeaders, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Status', 'Spillover?', 'Notes / Blockers'];
    
    const headerRow3 = worksheet.getRow(3);
    headerRow3.height = 25;
    
    colHeaders.forEach((h, i) => {
      const cell = headerRow3.getCell(i + 1);
      cell.value = h;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // 4. DATA ROWS
    const weekTasks = type === 'weekly' 
      ? tasks.filter(t => {
          const taskDate = t.due_date_raw ? new Date(t.due_date_raw) : null;
          return taskDate && isWithinInterval(taskDate, { start: intervalStart, end: weekEnd });
        })
      : tasks;

    const rowCount = Math.max(weekTasks.length, 15);
    const dayStartIdx = showAssignee ? 5 : 4;

    for (let i = 0; i < rowCount; i++) {
      const task = weekTasks[i];
      const row = worksheet.getRow(i + 4);
      
      const cells: any[] = [i + 1, task?.name || '', task?.project || '', task?.priority || ''];
      if (showAssignee) cells.push(task?.assignee?.name || '');
      for (let d = 0; d < 5; d++) cells.push(''); 
      cells.push(task?.status || '', task?.flags?.isSpillover ? 'Yes' : 'No', task?.text_content?.substring(0, 50) || '');

      cells.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.border = { 
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, 
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, 
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, 
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } } 
        };
        
        // Custom alignment for Task Title (Wrap)
        if (colIdx === 1) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 };
        } else if (colIdx === dayStartIdx + 8) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // --- IMPROVED DAY LOGIC ---
        if (task && colIdx >= dayStartIdx && colIdx < dayStartIdx + 5) {
          const dayOfWeek = colIdx - dayStartIdx;
          const currentDayDate = addDays(intervalStart, dayOfWeek);
          const start = task.start_date ? new Date(task.start_date) : null;
          const end = task.due_date_raw ? new Date(task.due_date_raw) : null;
          const closed = task.date_closed ? new Date(parseInt(task.date_closed)) : null;
          
          let isActive = false;
          if (start && end && currentDayDate >= start && currentDayDate <= end) isActive = true;
          if (closed && isSameDay(currentDayDate, closed)) isActive = true;
          
          if (isActive) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF3396' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.value = '✓';
          }
        }
      });
    }

    // 5. FOOTER SUMMARY
    const footerStart = rowCount + 6;
    worksheet.mergeCells(`A${footerStart}:B${footerStart}`);
    const summaryHeader = worksheet.getCell(`A${footerStart}`);
    summaryHeader.value = 'WEEK SUMMARY';
    summaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10024F' } };
    summaryHeader.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    summaryHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    const doneCount = weekTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done') || t.status.toLowerCase().includes('closed')).length;
    const inProgCount = weekTasks.filter(t => t.status.toLowerCase().includes('progress')).length;
    const spilledCount = weekTasks.filter(t => t.flags?.isSpillover).length;
    const pendingCount = Math.max(0, weekTasks.length - doneCount - inProgCount);

    const stats = [
      { label: `✓ Done: ${doneCount}`, color: 'FF22C55E' },
      { label: `⟳ In Prog: ${inProgCount}`, color: 'FFF59E0B' },
      { label: `↷ Spilled: ${spilledCount}`, color: 'FFEF4444' },
      { label: `□ Pending: ${pendingCount}`, color: 'FF3B82F6' }
    ];

    stats.forEach((stat, i) => {
      const cell = worksheet.getRow(footerStart).getCell(i + 3);
      cell.value = stat.label;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: stat.color } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // 6. DYNAMIC CANVAS CHART EMBEDDING (Requirement 5)
    if (chartBase64) {
      try {
        const imageId = workbook.addImage({
          base64: chartBase64,
          extension: 'png',
        });
        
        // Place chart 2 rows below the summary footer
        const chartStartRow = footerStart + 2;
        
        // Calculate dynamic width matching drawClusteredBarChart logic
        const uniqueKeys = new Set(tasks.map(t => groupBy === 'assignee' ? (t.assignee?.name || 'Unassigned') : t.project));
        const groupCount = Math.min(10, uniqueKeys.size);
        const chartWidth = Math.max(900, groupCount * 100 + 150);
        
        worksheet.addImage(imageId, {
          tl: { col: 1, row: chartStartRow },
          ext: { width: chartWidth, height: 500 }
        });
      } catch (embedErr) {
        console.error('Failed to embed dynamic chart image in spreadsheet:', embedErr);
      }
    }

    // Final Column Sizing
    worksheet.getColumn(1).width = 6;     // #
    worksheet.getColumn(2).width = 65;    // Task Title
    worksheet.getColumn(3).width = 30;    // Category
    worksheet.getColumn(4).width = 12;    // Priority
    if (showAssignee) worksheet.getColumn(5).width = 25;
    for (let c = dayStartIdx + 1; c <= dayStartIdx + 5; c++) worksheet.getColumn(c).width = 8;
    worksheet.getColumn(dayStartIdx + 6).width = 25;
    worksheet.getColumn(dayStartIdx + 7).width = 15;
    worksheet.getColumn(dayStartIdx + 8).width = 60;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `TM_labs_Report_${type}_${format(periodStartDate, 'yyyy-MM-dd')}.xlsx`);
}
