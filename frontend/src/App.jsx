import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-base-js';

// 1. Supabase 설정 (현성님 정보 유지)
const supabaseUrl = "https://jhduyrvvnjxxrwexdquw.supabase.co";
const supabaseKey = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr";
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [fruitEntries, setFruitEntries] = useState([]);

  // 데이터 가져오기 함수
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('freshness_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching data:', error);
    else setFruitEntries(data || []);
  };

  useEffect(() => {
    // 1. 초기 데이터 로드
    fetchData();

    // 2. 실시간 구독 (INSERT, DELETE 모두 대응)
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'freshness_data' },
        (payload) => {
          console.log('실시간 신호 도착!', payload);

          if (payload.eventType === 'INSERT') {
            // 입고 시: 리스트 맨 앞에 추가
            setFruitEntries((prev) => [payload.new, ...prev]);
          } 
          else if (payload.eventType === 'DELETE') {
            // 퇴고 시: 삭제된 데이터의 ID를 찾아서 즉시 제거
            // payload.old.id가 제대로 들어오려면 SQL Editor에서 REPLICA IDENTITY FULL 설정을 해야 합니다.
            const deletedId = payload.old.id;
            setFruitEntries((prev) => prev.filter(item => item.id !== deletedId));
            console.log(`${deletedId}번 항목이 화면에서 삭제되었습니다.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🍌 스마트 신선 보관함 재고 현황</h1>
      <hr />
      {fruitEntries.length === 0 ? (
        <p>현재 입고된 과일이 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {fruitEntries.map((fruit) => (
            <div key={fruit.id} style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '10px',
              backgroundColor: fruit.status === 'Fresh' ? '#e6fffa' : '#fff5f5',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
            }}>
              <h3>{fruit.label}</h3>
              <p>신선도: <strong>{fruit.percentage}%</strong></p>
              <p>상태: <span style={{ color: fruit.status === 'Fresh' ? 'green' : 'red' }}>{fruit.status}</span></p>
              <small style={{ color: '#888' }}>입고시간: {new Date(fruit.created_at).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
