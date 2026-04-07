import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhduyrvvnjxxrwexdquw.supabase.co";
const supabaseKey = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr";
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [fruitEntries, setFruitEntries] = useState([]);

  const fetchData = async () => {
    const { data } = await supabase.from('freshness_data').select('*').order('created_at', { ascending: false });
    setFruitEntries(data || []);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('final-demo').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'freshness_data' }, (p) => {
        if (p.eventType === 'INSERT') setFruitEntries(prev => [p.new, ...prev]);
        else if (p.eventType === 'DELETE') setFruitEntries(prev => prev.filter(i => i.id !== p.old.id));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // 날짜 변환 함수 (Invalid Date 방지)
  const formatMyDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? "방금 전" : `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f4f9f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#1b4332', fontSize: '2.8rem', fontWeight: '900' }}>Freshness Monitor</h1>
        <div style={{ height: '6px', width: '80px', backgroundColor: '#2d6a4f', margin: '15px auto', borderRadius: '10px' }}></div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '30px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {fruitEntries.map((fruit) => (
          <div key={fruit.id} style={{
            backgroundColor: '#fff',
            borderRadius: '30px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            // 상태에 따른 테두리 색상 변경 (신선: 초록 / 그 외: 주황)
            border: fruit.status === 'Fresh' ? '6px solid #2d6a4f' : '6px solid #f9a825',
            transition: 'transform 0.3s ease'
          }}>
            {fruit.image_data && (
              <img src={fruit.image_data} style={{ width: '100%', height: '240px', objectFit: 'cover' }} alt="입고 사진" />
            )}

            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1b4332' }}>{fruit.label}</h2>
              
              {/* 입고 날짜를 크게 표시 */}
              <div style={{ fontSize: '1.4rem', fontWeight: '600', color: '#555', marginBottom: '20px' }}>
                {formatMyDate(fruit.created_at)} 입고
              </div>

              {/* 신선도 상태를 아주 크게 강조 */}
              <div style={{ 
                display: 'inline-block',
                padding: '10px 30px', 
                borderRadius: '50px', 
                backgroundColor: fruit.status === 'Fresh' ? '#d8f3dc' : '#fff3e0', 
                color: fruit.status === 'Fresh' ? '#1b4332' : '#e65100', 
                fontSize: '1.6rem', 
                fontWeight: '900' 
              }}>
                {fruit.status === 'Fresh' ? '신선함' : '관리 필요'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;