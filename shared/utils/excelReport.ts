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
  };
}

export async function generateStyledReport(
  tasks: Task[], 
  type: 'weekly' | 'monthly' | 'quarterly', 
  periodName: string, 
  periodStartDate: Date,
  periodEndDate: Date,
  showAssignee: boolean = true
) {
  const workbook = new ExcelJS.Workbook();
  
  const intervals = type === 'weekly' 
    ? eachWeekOfInterval({ start: periodStartDate, end: periodEndDate })
    : [periodStartDate];

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
      // REMOVED fixed height to allow wrapText to work properly
      
      const cells: any[] = [i + 1, task?.name || '', task?.project || '', task?.priority || ''];
      if (showAssignee) cells.push(task?.assignee?.name || '');
      for (let d = 0; d < 5; d++) cells.push(''); 
      cells.push(task?.status || '', task?.flags.isSpillover ? 'Yes' : 'No', task?.text_content?.substring(0, 50) || '');

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

    const doneCount = weekTasks.filter(t => t.status.toLowerCase().includes('complete') || t.status.toLowerCase().includes('done')).length;
    const inProgCount = weekTasks.filter(t => t.status.toLowerCase().includes('progress')).length;
    const spilledCount = weekTasks.filter(t => t.flags.isSpillover).length;
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
