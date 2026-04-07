useEffect(() => {
  const fetchData = async () => {
    const { data } = await supabase.from('freshness_data').select('*').order('created_at', { ascending: false });
    setFruitEntries(data || []);
  };
  fetchData();

  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'freshness_data' }, 
      (payload) => {
        console.log('실시간 신호 도착!', payload); // 브라우저 검사(F12)창에서 확인 가능
        
        if (payload.eventType === 'INSERT') {
          setFruitEntries((prev) => [payload.new, ...prev]);
        } 
        else if (payload.eventType === 'DELETE') {
          // [핵심] 삭제된 데이터의 ID를 찾아서 내 리스트에서 즉시 제거
          const deletedId = payload.old.id;
          setFruitEntries((prev) => prev.filter(item => item.id !== deletedId));
          console.log(deletedId, '번 바나나 화면에서 삭제됨');
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);