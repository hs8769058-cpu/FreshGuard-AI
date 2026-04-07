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
    const channel = supabase.channel('realtime-green').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'freshness_data' }, (p) => {
        if (p.eventType === 'INSERT') setFruitEntries(prev => [p.new, ...prev]);
        else if (p.eventType === 'DELETE') setFruitEntries(prev => prev.filter(i => i.id !== p.old.id));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f0f7f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* 초록색 메인 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2d6a4f', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Freshness Monitor</h1>
        <div style={{ height: '5px', width: '50px', backgroundColor: '#52b788', margin: '0 auto', borderRadius: '10px' }}></div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {fruitEntries.map((fruit) => (
          <div key={fruit.id} style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 15px 30px rgba(0,0,0,0.05)',
            border: '1px solid #e9f5ee'
          }}>
            {/* 실시간으로 찍힌 바나나 사진 */}
            {fruit.image_data ? (
              <img src={fruit.image_data} style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt="Live Capture" />
            ) : (
              <div style={{ width: '100%', height: '220px', backgroundColor: '#f8f9fa' }} />
            )}

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#1b4332', fontSize: '1.5rem' }}>{fruit.label}</h2>
                <span style={{ 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  backgroundColor: '#d8f3dc', 
                  color: '#2d6a4f', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold' 
                }}>신선함</span>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#555' }}>품질 지수: <span style={{ color: '#2d6a4f', fontWeight: '700' }}>{fruit.percentage}/100</span></div>
              <div style={{ color: '#adb5bd', fontSize: '0.8rem', marginTop: '15px', textAlign: 'right' }}>
                {new Date(fruit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 입고
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;