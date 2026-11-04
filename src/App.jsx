import React,{ useEffect, useMemo, useRef, useState } from 'react';
import { Search, Clapperboard, Bookmark, BookmarkCheck, X, Star, CalendarDays, Clock3, Film, Play, ArrowUpRight, Sparkles, Heart, ChevronRight, SlidersHorizontal } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
const API = 'https://www.omdbapi.com/';
const FALLBACK_POSTER = 'https://placehold.co/420x620/171a22/e8e8e8?text=No+Poster';
const starterSearches = ['Interstellar', 'The Dark Knight', 'Dune', 'Inception'];

function readSaved() {
  try { return JSON.parse(localStorage.getItem('frame-favorites') || '[]'); }
  catch { return []; }
}

function Poster({ movie, className = '' }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={!failed && movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_POSTER}
    alt={`${movie.Title} poster`} loading="lazy" onError={() => setFailed(true)} />;
}

function MovieCard({ movie, saved, onSave, onOpen, index }) {
  return <article className="movie-card" style={{'--i': index}}>
    <button className="poster-button" onClick={() => onOpen(movie)} aria-label={`View ${movie.Title} details`}>
      <Poster movie={movie} className="poster" />
      <span className="poster-overlay"><span className="view-pill"><Play size={13} fill="currentColor"/> View details</span></span>
    </button>
    <button className={`save-btn ${saved ? 'is-saved' : ''}`} onClick={() => onSave(movie)} aria-label={saved ? 'Remove from favourites' : 'Add to favourites'}>
      {saved ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>}
    </button>
    <div className="movie-meta">
      <div className="movie-title-line"><h3>{movie.Title}</h3><span>{movie.Year}</span></div>
      <p>{movie.Type || 'Movie'} <i/> {movie.imdbID}</p>
    </div>
  </article>;
}

function DetailModal({ movie, onClose, saved, onSave }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch(`${API}?i=${encodeURIComponent(movie.imdbID)}&plot=full&apikey=${API_KEY}`)
      .then(r => r.json()).then(data => { if (active && data.Response === 'True') setDetails(data); })
      .catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [movie.imdbID]);
  const data = details || movie;
  return <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) onClose();}}>
    <section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${movie.Title} details`}>
      <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
      <div className="detail-poster-wrap"><Poster movie={movie} className="detail-poster"/></div>
      <div className="detail-content">
        <div className="eyebrow"><span className="live-dot"/> FILM PROFILE</div>
        <h2>{data.Title}</h2>
        <div className="detail-tags"><span>{data.Year}</span><span>{data.Rated || 'NR'}</span><span>{data.Runtime || '—'}</span></div>
        <div className="rating-row"><Star size={17} fill="currentColor"/><strong>{data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : 'Not rated'}</strong><span>IMDb rating</span></div>
        <p className="plot">{loading ? 'Loading the story...' : (data.Plot && data.Plot !== 'N/A' ? data.Plot : 'No plot summary is available for this title.')}</p>
        <div className="detail-facts">
          <div><small>DIRECTOR</small><b>{data.Director || '—'}</b></div>
          <div><small>GENRE</small><b>{data.Genre || '—'}</b></div>
          <div><small>CAST</small><b>{data.Actors || '—'}</b></div>
        </div>
        <button className={`primary-btn modal-save ${saved ? 'saved' : ''}`} onClick={() => onSave(movie)}>
          {saved ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>} {saved ? 'Saved to favourites' : 'Add to favourites'}
        </button>
        <p className="imdb-note">Movie information provided by OMDb.</p>
      </div>
    </section>
  </div>;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState(readSaved);
  const [activeTab, setActiveTab] = useState('discover');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { localStorage.setItem('frame-favorites', JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    if (!query) return;
    if (!API_KEY) { setMovies([]); setError('Add your OMDb API key to the .env file to start searching.'); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError(''); setSearched(true);
    fetch(`${API}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}`, {signal: controller.signal})
      .then(r => r.json())
      .then(data => {
        if (data.Response === 'True') setMovies(data.Search || []);
        else { setMovies([]); setError(data.Error || 'No titles found. Try another search.'); }
      })
      .catch(e => { if (e.name !== 'AbortError') setError('Could not connect to OMDb. Check your connection and try again.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query]);

  const visibleMovies = useMemo(() => activeTab === 'favorites' ? favorites : movies, [activeTab, favorites, movies]);
  const isSaved = id => favorites.some(item => item.imdbID === id);
  function toggleFavorite(movie) {
    setFavorites(prev => prev.some(item => item.imdbID === movie.imdbID)
      ? prev.filter(item => item.imdbID !== movie.imdbID) : [movie, ...prev]);
  }
  function search(value = input) {
    const clean = value.trim();
    if (!clean) { inputRef.current?.focus(); return; }
    setInput(clean); setActiveTab('discover'); setQuery(clean);
  }
  function changeTab(tab) { setActiveTab(tab); if (tab === 'discover' && !movies.length && !query) setSearched(false); }

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => {e.preventDefault(); changeTab('discover');}}><span className="brand-mark"><Clapperboard size={19}/></span> FRAME<span className="brand-period">.</span></a>
      <nav className="main-nav" aria-label="Main navigation">
        <button className={activeTab === 'discover' ? 'active' : ''} onClick={() => changeTab('discover')}>Discover</button>
        <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => changeTab('favorites')}>My collection <span className="nav-count">{favorites.length}</span></button>
      </nav>
      <div className="topbar-right"><span className="status-indicator"/> YOUR PERSONAL CINEMA</div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={14}/> THE MOVIE DISCOVERY LIBRARY</div>
        <h1>Find your next<br/><em>great story.</em></h1>
        <p>A universe of cinema, one search away. Explore films, uncover details, and keep the ones you love close.</p>
        <form className="search-form" onSubmit={e => {e.preventDefault(); search();}}>
          <Search size={19} className="search-icon"/>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Search a film, a title, a story..." aria-label="Search movies"/>
          {input && <button type="button" className="clear-search" onClick={() => {setInput(''); inputRef.current?.focus();}} aria-label="Clear search"><X size={16}/></button>}
          <button className="search-submit" type="submit">Search <ArrowUpRight size={16}/></button>
        </form>
        <div className="quick-search"><span>TRY SEARCHING</span>{starterSearches.map(s => <button key={s} onClick={() => {setInput(s); search(s);}}>{s}</button>)}</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-glow"/>
        <div className="art-frame art-frame-back"><div className="art-sun"/></div>
        <div className="art-frame art-frame-front"><div className="art-silhouette"/><div className="art-caption">THE ART OF<br/>CINEMA</div></div>
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <span className="art-index">NO. 001 — 2026</span>
      </div>
    </section>

    <section className="library-section">
      <div className="section-heading">
        <div><div className="eyebrow">{activeTab === 'favorites' ? 'YOUR PERSONAL SELECTION' : searched ? 'SEARCH RESULTS' : 'CURATED FOR THE CURIOUS'}</div>
          <h2>{activeTab === 'favorites' ? 'Your collection' : searched ? <>Results for <em>“{query}”</em></> : <>Explore the <em>library.</em></>}</h2></div>
        <div className="section-tools"><span>{activeTab === 'favorites' ? `${favorites.length} SAVED` : `${movies.length} ${searched ? 'MATCHES' : 'TITLES'}`}</span><SlidersHorizontal size={17}/></div>
      </div>

      {activeTab === 'favorites' && favorites.length === 0 ? <div className="empty-state"><div className="empty-icon"><Heart size={25}/></div><h3>Your collection is waiting.</h3><p>Save films that catch your eye and they'll live here.</p><button className="text-btn" onClick={() => changeTab('discover')}>Explore movies <ChevronRight size={16}/></button></div>
      : loading ? <div className="movie-grid">{Array.from({length:8},(_,i)=><div className="skeleton-card" key={i}><div className="skeleton-poster"/><div className="skeleton-line"/></div>)}</div>
      : error ? <div className="empty-state"><div className="empty-icon"><Film size={25}/></div><h3>{error.includes('API key') ? 'One quick setup.' : 'Nothing on this reel.'}</h3><p>{error}</p>{error.includes('API key') && <p className="setup-hint">Create a free key at <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noreferrer">omdbapi.com</a>, then add it as VITE_OMDB_API_KEY in your .env file.</p>}</div>
      : visibleMovies.length ? <div className="movie-grid">{visibleMovies.map((movie,i)=><MovieCard key={movie.imdbID} movie={movie} index={i} saved={isSaved(movie.imdbID)} onSave={toggleFavorite} onOpen={setSelected}/>)}</div>
      : <div className="empty-state"><div className="empty-icon"><Clapperboard size={25}/></div><h3>{searched ? 'No films found.' : 'Your next favourite is out there.'}</h3><p>{searched ? 'Try a different title or check the spelling.' : 'Use the search above to explore the OMDb movie library.'}</p>{!searched && <button className="text-btn" onClick={() => {setInput('Interstellar');search('Interstellar');}}>Start exploring <ChevronRight size={16}/></button>}</div>}
    </section>

    <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><Clapperboard size={16}/></span> FRAME<span className="brand-period">.</span></a><span>MADE FOR THE LOVE OF FILM.</span><span>POWERED BY <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer">OMDb API</a></span></footer>
    {selected && <DetailModal movie={selected} onClose={() => setSelected(null)} saved={isSaved(selected.imdbID)} onSave={toggleFavorite}/>}
  </main>;
}
