export async function collectEmail(email: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`[Mock] Email collected: ${email}`);
  return { success: true };
}
