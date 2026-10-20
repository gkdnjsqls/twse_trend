/* Static GitHub Pages client. Data stays local; external links open only on click. */
(() => {
  'use strict';
  const market = window.MARKET_DATA;
  if (!market || !market.up || !market.down) return;
  const $ = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat('ko-KR', {maximumFractionDigits:0});
  const date = market.date;
  const params = new URLSearchParams(location.search);
  const state = {side: params.get('side') === 'down' ? 'down' : 'up', view: params.get('view') === 'table' ? 'table' : 'map', query:'', limitOnly:false, selected:params.get('code') || '2317', sort:'pct_num', sortDir:null};
  const statusClass = value => value === '뉴스 미확인' ? 'unknown' : value === '업종 동반' ? 'sector' : '';
  const polarity = value => value > 0.000001 ? 'positive' : value < -0.000001 ? 'negative' : 'neutral';
  const pct = d => `${d.pct_num > 0 ? '+' : ''}${d.pct_num.toFixed(1)}%`;
  const isLimit = d => state.side === 'up' ? d.pct_num >= 9.5 : d.pct_num <= -9.5;
  function make(tag, text, className) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
  function data() {return market[state.side];}
  function filtered() {
    const q=state.query.toLocaleLowerCase().trim();
    const items=data().filter(d => (!state.limitOnly || isLimit(d)) && (!q || [d.name,d.code,d.theme,d.group,d.reason_ko].some(v=>(v||'').toLocaleLowerCase().includes(q))));
    const dir=state.sortDir ?? (state.side==='down'?1:-1);
    return items.slice().sort((a,b)=>(a[state.sort]-b[state.sort])*dir || a.code.localeCompare(b.code));
  }
  function setURL(){const url=new URL(location.href);url.searchParams.set('side',state.side);url.searchParams.set('code',state.selected);url.searchParams.set('view',state.view);try{history.replaceState(null,'',url);}catch(_){} }
  function select(code, focus=false){state.selected=code;renderDetail();document.querySelectorAll('.stock-leaf').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.code===code)));setURL();if(focus && matchMedia('(max-width:730px)').matches)$('stock-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});}
  function sourceList(d) {
    const div=make('div');
    if(!d.sources.length){div.append(make('p','종목 움직임을 설명할 명확한 뉴스 출처를 찾지 못했습니다.','detail-reason'));return div;}
    d.sources.forEach((url,i)=>{
      let host;try{const u=new URL(url);if(!['https:','http:'].includes(u.protocol))return;host=u.hostname.replace(/^www\./,'');}catch(_){return;}
      const a=make('a',undefined,'source-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(make('span',`${String(i+1).padStart(2,'0')}  ${host}`),make('small','원문 ↗'));div.append(a);
    });return div;
  }
  function renderDetail(){
    const d=data().find(d=>d.code===state.selected);
    const panel=$('stock-detail');panel.replaceChildren();
    if(!d){panel.append(make('p','종목을 선택하면 뉴스와 출처가 표시됩니다.'));return;}
    const kicker=make('div',undefined,'detail-kicker');kicker.append(make('span','SELECTED STOCK'),make('span',isLimit(d)?(state.side==='up'?'상한가 근사 기준':'하한가 근사 기준'):'거래량 조건 순위'));
    const title=make('h3',d.name,'detail-title');title.append(make('span',d.code));
    panel.append(kicker,title,make('p',`${d.group} / ${d.theme}`,'detail-theme'));
    const metrics=make('div',undefined,'detail-metrics');
    const change=make('div');change.append(make('small','당일 등락률'),make('strong',pct(d),`big ${polarity(d.pct_num)}`));
    const volume=make('div');const volval=make('strong',fmt.format(d.volume_num));volval.append(make('span','장','unit'));volume.append(make('small','거래량'),volval);
    const value=make('div');const valval=make('strong',(d.value_num/1e8).toFixed(0));valval.append(make('span','억','unit'));value.append(make('small','거래대금 · NT$'),valval);metrics.append(change,volume,value);
    const story=make('div',undefined,'detail-section');const h=make('h4','확인된 배경');h.append(make('span',d.status,`badge ${statusClass(d.status)}`));story.append(h,make('p',d.reason_ko,'detail-reason'));
    const dates=make('p',undefined,'detail-date');dates.append(make('span',`뉴스·사건 ${d.date==='N/A'?'미확인':d.date}`),make('span',`가격 ${d.asof}`));story.append(dates);
    const sources=make('div',undefined,'detail-section');sources.append(make('h4','확인 출처'),sourceList(d));
    panel.append(metrics,story,sources,make('p','관련 뉴스·수급은 관찰한 배경이며, 단일 원인으로 확정한 설명은 아닙니다.','detail-footnote'));
    if(d.asof!==date)panel.append(make('p',`당일 가격이 없어 마지막 유효일(${d.asof}) 기준입니다.`,'detail-footnote'));
  }
  function renderMap(items){
    const container=$('theme-branches');container.replaceChildren();
    const groupNames=[...new Set(items.map(d=>d.group))].sort((a,b)=>items.filter(d=>d.group===b).length-items.filter(d=>d.group===a).length);
    for(const group of groupNames){
      const members=items.filter(d=>d.group===group);
      const branch=make('section',undefined,'branch');const heading=make('h3',group,'branch-head');heading.append(make('small',`${members.length}개`));const leaves=make('div',undefined,'stock-leaves');
      for(const d of members){const button=make('button',undefined,'stock-leaf');button.type='button';button.dataset.code=d.code;button.setAttribute('aria-pressed',String(state.selected===d.code));button.setAttribute('aria-label',`${d.code} ${d.name}, ${pct(d)}, ${d.theme}`);const name=make('span',d.name);if(isLimit(d))name.append(make('span',state.side==='up'?'상한가*':'하한가*','leaf-limit'));button.append(name,make('strong',pct(d),polarity(d.pct_num)));button.addEventListener('click',()=>select(d.code,true));leaves.append(button);}
      branch.append(heading,leaves);container.append(branch);
    }
  }
  function renderTable(items){
    const body=$('stock-rows');body.replaceChildren();
    items.forEach(d=>{const row=make('tr');const nameCell=make('td');const button=make('button',d.name,'table-name');button.type='button';button.append(make('small',d.code));button.addEventListener('click',()=>{state.view='map';state.selected=d.code;render();if(matchMedia('(max-width:730px)').matches)$('stock-detail').scrollIntoView({block:'start'});});nameCell.append(button);const themeCell=make('td',`${d.group} / ${d.theme}`,'theme-cell');const statusCell=make('td');statusCell.append(make('span',d.status,`badge ${statusClass(d.status)}`));row.append(nameCell,themeCell,make('td',pct(d),`number ${polarity(d.pct_num)}`),make('td',fmt.format(d.volume_num),'number'),statusCell,make('td',d.reason_ko,'reason-cell'));body.append(row);});
    document.querySelectorAll('[data-sort]').forEach(button=>{const active=state.sort===button.dataset.sort;button.parentElement.setAttribute('aria-sort',active?((state.sortDir??(state.side==='down'?1:-1))===1?'ascending':'descending'):'none');button.querySelector('span').textContent=active?((state.sortDir??(state.side==='down'?1:-1))===1?'↑':'↓'):'↕';});
  }
  function render(){
    const items=filtered();
    if(items.length&&!items.some(d=>d.code===state.selected))state.selected=items[0].code;
    document.body.dataset.side=state.side;
    document.querySelectorAll('[data-side]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.side===state.side));});
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
    $('limit-label').textContent=state.side==='up'?'상한가 기준만':'하한가 기준만';
    $('limit-only').checked=state.limitOnly;
    $('selection-note').textContent=state.side==='up'?'전일 대비 +9.5% 이상 전체 + 비상한가·거래량 1만 장 이상 상위 30개. 보합·하락 종목도 포함될 수 있습니다.':'전일 대비 -9.5% 이하 전체 + 비하한가·거래량 1만 장 이상 하위 30개. 가격이 아닌 당일 등락률 기준입니다.';
    $('root-label').textContent=state.side==='up'?'상승 측 테마':'하락 측 테마';$('root-count').textContent=`${items.length} STOCKS`;
    const up=items.filter(d=>d.pct_num>1e-6).length,down=items.filter(d=>d.pct_num<-1e-6).length,flat=items.length-up-down;
    $('results').textContent=`${items.length}개 종목 표시 · 실제 상승 ${up} / 보합 ${flat} / 하락 ${down}`;
    const empty=items.length===0;
    $('map-view').hidden=empty||state.view!=='map';$('table-view').hidden=empty||state.view!=='table';$('empty-state').hidden=!empty;
    $('empty-copy').textContent=state.side==='down'&&state.limitOnly&&market.meta.down.limit===0?'이 날짜에는 하한가 근사 기준(-9.5% 이하)에 해당하는 종목이 없습니다.':'검색어나 선택 조건을 바꿔 보세요.';
    renderMap(items);renderTable(items);renderDetail();setURL();
  }
  const upLimit=market.meta.up.limit,downLimit=market.meta.down.limit;
  $('up-total').replaceChildren(document.createTextNode(market.up.length),make('span','종목'));
  $('down-total').replaceChildren(document.createTextNode(market.down.length),make('span','종목'));
  $('up-breakdown').textContent=`상한가 기준 ${upLimit} + 거래량 순위 ${market.meta.up.top}`;
  $('down-breakdown').textContent=`하한가 기준 ${downLimit} + 거래량 하위 ${market.meta.down.bottom}`;
  const all=[...market.up,...market.down];const unknown=all.filter(d=>d.status==='뉴스 미확인').length;
  $('researched-total').replaceChildren(document.createTextNode(all.length-unknown),make('span','종목'));
  $('unknown-total').textContent=`뉴스 미확인 ${unknown}개 별도 표시`;
  $('up-count').textContent=market.up.length;$('down-count').textContent=market.down.length;
  $('header-date').textContent=date.replaceAll('-','.');$('header-date').dateTime=date;$('main-date').textContent=date.replaceAll('-','.');
  $('missing-note').textContent=`당일 거래대금 누락 ${market.meta.down.missing_latest.length}개: ${market.meta.down.missing_latest.join(', ')||'없음'}. 원본은 종목별 마지막 유효 거래일을 사용하므로 당일 누락이 반드시 선별 제외와 같지는 않습니다.`;
  const stale=all.filter(d=>d.asof!==date);
  $('stale-note').textContent=stale.length?`선정 종목 중 과거 가격 기준 ${stale.length}개: ${stale.map(d=>d.name+' '+d.asof).join(', ')}`:'선정된 모든 종목의 가격 기준일은 관찰 기준일과 일치합니다.';
  document.querySelectorAll('button[data-side]').forEach(button=>button.addEventListener('click',()=>{state.side=button.dataset.side;state.sort='pct_num';state.sortDir=null;state.selected='';render();}));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;render();}));
  $('stock-search').addEventListener('input',e=>{state.query=e.target.value;render();});
  $('limit-only').addEventListener('change',e=>{state.limitOnly=e.target.checked;render();});
  $('reset-filters').addEventListener('click',()=>{state.query='';state.limitOnly=false;$('stock-search').value='';render();});
  document.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.sort;if(state.sort===key)state.sortDir=-(state.sortDir??(state.side==='down'?1:-1));else{state.sort=key;state.sortDir=-1;}render();}));
  $('csv-download').addEventListener('click',()=>{
    const safe=v=>{if(typeof v==='number')return Number.isFinite(v)?String(v):'';let s=String(v??'');if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
    const rows=[['기준일','선정 측','코드','종목','테마','등락률(%)','거래량(장)','거래대금(NT$)','근거','뉴스 날짜','설명','출처'],...filtered().map(d=>[date,state.side,d.code,d.name,d.theme,d.pct_num,d.volume_num,d.value_num,d.status,d.date,d.reason_ko,d.sources.join(' | ')])];
    const blob=new Blob(['\ufeff'+rows.map(r=>r.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=make('a');a.href=url;a.download=`taiwan-market-${date}-${state.side}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();
})();
