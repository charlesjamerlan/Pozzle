export async function crawlUrl(url: string): Promise<{ success: boolean; pages: number }> {
  // Simulate 1.5s delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log(`[Mock] Crawling ${url}`);
  return { success: true, pages: 1 };
}
