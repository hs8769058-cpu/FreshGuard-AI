import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // 패키지명 정확히 수정

// 1. Supabase 설정 (현성님 정보 유지)
const supabaseUrl = "https://jhduyrvvnjxxrwexdquw.supabase.co";
const supabaseKey = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr";
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [fruitEntries, setFruitEntries] = useState([]);

  // 데이터 로드 함수 (새로고침 없이 상태 업데이트를 위해 사용)
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('freshness_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('데이터 로드 실패:', error);
    else setFruitEntries(data || []);
  };

  useEffect(() => {
    fetchData(); // 처음 접속 시 데이터 로드

    // 2. 실시간 구독 설정
    const channel = supabase
      .channel('realtime-inventory')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'freshness_data' },
        (payload) => {
          console.log('실시간 변화 감지:', payload);

          if (payload.eventType === 'INSERT') {
            // 새 데이터가 들어오면 리스트 맨 앞에 추가
            setFruitEntries((prev) => [payload.new, ...prev]);
          } 
          else if (payload.eventType === 'DELETE') {
            // 삭제된 데이터 처리 (SQL에서 REPLICA IDENTITY FULL 설정이 되어 있어야 함)
            const deletedId = payload.old.id;
            
            if (deletedId) {
              setFruitEntries((prev) => prev.filter(item => item.id !== deletedId));
              console.log(`${deletedId}번 데이터 화면 삭제 완료`);
            } else {
              // 혹시라도 ID를 못 받아오면 전체 데이터를 다시 불러와서 강제 동기화
              fetchData();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🍌 Smart Storage System</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>실시간 재고 현황 모니터링 중...</p>
      <hr style={{ margin: '20px 0', border: '0.5px solid #ddd' }} />
      
      {fruitEntries.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#aaa' }}>
          <h3>현재 감지된 재고가 없습니다.</h3>
          <p>카메라 앞에 과일을 놓아주세요.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {fruitEntries.map((fruit) => (
            <div key={fruit.id} style={{
              backgroundColor: '#fff',
              border: fruit.status === 'Fresh' ? '2px solid #38b2ac' : '2px solid #e53e3e',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{ marginTop: 0 }}>{fruit.label}</h2>
              <p>품질 지수: <strong style={{ fontSize: '1.2rem' }}>{fruit.percentage}%</strong></p>
              <p>상태: 
                <span style={{ 
                  marginLeft: '10px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: fruit.status === 'Fresh' ? '#e6fffa' : '#fff5f5',
                  color: fruit.status === 'Fresh' ? '#2c7a7b' : '#c53030',
                  fontWeight: 'bold'
                }}>
                  {fruit.status === 'Fresh' ? '양호' : '관리필요'}
                </span>
              </p>
              <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#888' }}>
                감지 시각: {new Date(fruit.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;