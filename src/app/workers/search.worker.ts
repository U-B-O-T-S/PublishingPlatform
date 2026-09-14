/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const { articles, query, filterType } = data;

  if (!query || query.trim() === '') {
    postMessage(articles);
    return;
  }

  const q = query.toLowerCase().trim();

  const filtered = (articles || []).filter((item: any) => {
    if (filterType === 'author') {
      return item.user?.name?.toLowerCase().includes(q) || item.user?.username?.toLowerCase().includes(q);
    }
    const titleMatch = item.title?.toLowerCase().includes(q);
    const descMatch = item.description?.toLowerCase().includes(q);
    const tagMatch = item.tag_list?.some((tag: string) => tag.toLowerCase().includes(q));
    const authorMatch = item.user?.name?.toLowerCase().includes(q);
    return titleMatch || descMatch || tagMatch || authorMatch;
  });

  postMessage(filtered);
});
