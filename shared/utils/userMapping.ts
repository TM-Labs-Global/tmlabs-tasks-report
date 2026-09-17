// ClickUp User ID -> Supabase Profile UUID mapping
export const userMapping: Record<string, string> = {
  "106694873": "cc8ebbbf-ed55-4479-aced-2977f8e71002",
  "106697414": "c205c67b-75bd-4107-b1c1-60ab78f0d547",
  "106698158": "2c5e72c7-e150-463a-8103-62416a1cb749",
  "106698577": "02cb5cb3-b8e7-4b9b-9ed6-70be858c77d7",
  "106718586": "f909ef6f-1c2d-4dab-a795-4417761537bc",
  "106718658": "16212433-4638-4876-823f-d6ff3fbfce4a",
  "106718768": "1f4678e8-41a9-4919-8fac-52e9f484addb",
  "106718770": "146c91c1-12a2-4482-95cc-944c42891313",
  "106765034": "d849b160-fb3d-4d88-82b7-4c6b380bf5c8",
  "290643456": "29020d6a-ee5e-424f-8456-a80d55dfc7a2"
};

export function mapUser(clickupId: string | number): string | null {
  const idStr = String(clickupId);
  return userMapping[idStr] || null;
}
