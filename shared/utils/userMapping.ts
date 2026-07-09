// ClickUp User ID -> Supabase Profile UUID mapping
export const userMapping: Record<string, string> = {
  "106694873": "cc8ebbbf-ed55-4479-aced-2977f8e71002",
  "106697414": "aa903aa5-3147-4c46-9c3f-a2ac36cbb3d5",
  "106698158": "27b42b5b-cec0-423c-8927-62128723029e",
  "106698577": "c5726e77-8653-4330-9943-6a34514e6b74",
  "106718586": "f909ef6f-1c2d-4dab-a795-4417761537bc",
  "106718658": "16212433-4638-4876-823f-d6ff3fbfce4a",
  "106718768": "2e78b562-d80e-415e-8132-8e38c4ec22e4",
  "106718770": "146c91c1-12a2-4482-95cc-944c42891313",
  "106765034": "c311c823-8166-4f10-8a79-f59f523649c2",
  "290643456": "29020d6a-ee5e-424f-8456-a80d55dfc7a2"
};

export function mapUser(clickupId: string | number): string | null {
  const idStr = String(clickupId);
  return userMapping[idStr] || null;
}
