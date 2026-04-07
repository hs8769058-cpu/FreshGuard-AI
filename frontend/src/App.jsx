import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [fruitEntries, setFruitEntries] = useState([]); 

 useEffect(() => {
  fetchData(); // 초기 데이터 로드

  const channel = supabase
    .channel('realtime-fruit')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'freshness_data' }, 
      (payload) => {
        console.log('변화 감지:', payload);
        
        if (payload.eventType === 'INSERT') {
          // 추가됐을 때: 리스트 앞에 즉시 추가
          setFruitEntries((prev) => [payload.new, ...prev]);
        } 
        else if (payload.eventType === 'DELETE') {
          // 삭제됐을 때: 내 화면 리스트에서도 해당 ID를 가진 놈을 즉시 제거
          // (payload.old.id를 써야 정확히 지워집니다!)
          setFruitEntries((prev) => prev.filter(item => item.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
    // 실시간 연동 (Insert 감지)
    const channel = supabase
      .channel('freshness_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'freshness_data' }, (payload) => {
        const newItem = payload.new;
        // 알림 로직 (과숙성 직전/상함 팝업)
        if (newItem.status === 'Bad' || newItem.percentage < 30) {
          alert(`🚨 [경고] ${newItem.label === 'Apple' ? '사과' : '바나나'}가 상할 위험이 있습니다!`);
        } else if (newItem.percentage < 60) {
          alert(`⚠️ [주의] ${newItem.label === 'Banana' ? '바나나' : '사과'}가 과숙성 직전입니다.`);
        }
        fetchData(); 
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 상태 판별 함수
  const getStatusInfo = (percentage) => {
    const p = Number(percentage);
    if (p < 30) return { text: '상함', color: '#e74c3c' };
    if (p < 60) return { text: '과숙성 직전', color: '#f39c12' };
    return { text: '양호', color: '#2ecc71' };
  };

  // 날짜 표시 함수
  const formatDate = (dateStr) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // [추가] 라벨에 따라 바나나 사진까지 완벽하게 매핑
  const getFruitImage = (label) => {
    const l = label?.toLowerCase(); // 대소문자 문제 방지
    if (l === 'apple') return '/apple_sample.jpg';
    if (l === 'banana') return '/banana_sample.jpg';
    return '/placeholder.jpg'; // 혹시 모를 대안 사진
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">FreshGuard <span style={{color: '#2ecc71'}}>AI</span></h1>
        <div className="icon-bell">🔔</div>
      </header>

      <main className="main-content">
        <section className="summary-section">
          <h2>📦 실시간 보관함 현황</h2>
          <p>AI가 카메라로 분석한 과일 상태입니다.</p>
        </section>

        {/* 🔥 최적화된 십자형 그리드 배치 */}
        <section className="fruit-grid">
          {fruitEntries.length > 0 ? (
            fruitEntries.map((item) => {
              const info = getStatusInfo(item.percentage);
              return (
                <div key={item.id} className="fruit-grid-card">
                  {/* 사진 컨테이너: 크기 고정 및 비율 유지 */}
                  <div className="fruit-img-container">
                    <img src={getFruitImage(item.label)} alt="snapshot" className="snapshot-img" />
                    <div className="status-badge" style={{ color: info.color }}>{info.text}</div>
                  </div>
                  
                  {/* 텍스트 영역: 사진 아래에 깔끔하게 배치 */}
                  <div className="fruit-info-text">
                    <span className="entry-date">{formatDate(item.created_at)} 입고</span>
                    <h3 className="fruit-name">
                      {item.label?.toLowerCase() === 'apple' ? '사과' : item.label?.toLowerCase() === 'banana' ? '바나나' : '과일'}
                    </h3>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px'}}>데이터 수신 중...</p>
          )}
        </section>

        <section className="action-buttons">
          <button className="btn-refresh" onClick={() => window.location.reload()}>시스템 새로고침</button>
        </section>
      </main>
    </div>
  );
}

export default App;