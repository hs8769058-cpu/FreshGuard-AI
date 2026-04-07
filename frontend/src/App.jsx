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
    const channel = supabase.channel('final-fix').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'freshness_data' }, (p) => {
        if (p.eventType === 'INSERT') setFruitEntries(prev => [p.new, ...prev]);
        else if (p.eventType === 'DELETE') setFruitEntries(prev => prev.filter(i => i.id !== p.old.id));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // [강력 수정] 시간 정보가 없으면 현재 시간을 강제로 할당
  const formatTime = (isoStr) => {
    // 데이터에 시간 정보가 없으면(null/undefined) 현재 시간을 사용합니다.
    const d = isoStr ? new Date(isoStr) : new Date();
    
    // 혹시라도 날짜 객체가 생성이 안 되면 현재 시간으로 재시도
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    
    const month = validDate.getMonth() + 1;
    const date = validDate.getDate();
    const hours = String(validDate.getHours()).padStart(2, '0');
    const minutes = String(validDate.getMinutes()).padStart(2, '0');
    
    return `${month}/${date} ${hours}:${minutes}`;
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f2f8f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#2d6a4f', fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>Freshness Monitor</h1>
        <div style={{ height: '5px', width: '70px', backgroundColor: '#52b788', margin: '15px auto', borderRadius: '10px' }}></div>
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
            borderRadius: '35px',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
            border: fruit.status === 'Fresh' ? '6px solid #40916c' : '6px solid #fb8c00',
            transition: 'all 0.3s ease'
          }}>
            {fruit.image_data && (
              <img src={fruit.image_data} style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt="입고 사진" />
            )}

            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: '#1b4332' }}>{fruit.label}</h2>
              
              {/* 날짜가 크게 나옴 */}
              <div style={{ fontSize: '1.6rem', color: '#444', fontWeight: '700', marginBottom: '20px' }}>
                {formatTime(fruit.created_at)} 입고
              </div>

              <div style={{ 
                display: 'inline-block',
                padding: '12px 35px', 
                borderRadius: '50px', 
                backgroundColor: fruit.status === 'Fresh' ? '#d8f3dc' : '#fff3e0', 
                color: fruit.status === 'Fresh' ? '#2d6a4f' : '#e65100', 
                fontSize: '1.8rem', 
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
