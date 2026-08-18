'use client';

import React, { useEffect, useState } from 'react';
import { 
  Instagram, 
  Sparkles, 
  RefreshCw, 
  Send, 
  Film, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

interface MediaItem {
  id: string;
  publicId: string;
  secureUrl: string;
  mediaType: 'REEL' | 'IMAGE';
  caption: string;
  status: 'pending' | 'posted' | 'failed';
  folder?: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'REEL' | 'IMAGE'>('ALL');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to load media assets' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handlePublish = async (item: MediaItem) => {
    setPublishing(item.id);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Successfully sent "${item.publicId}" to Blotato API!` });
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: data.warning || data.error || 'Blotato API credentials need to be configured in Vercel environment variables.' 
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setPublishing(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    return item.mediaType === filter;
  });

  const reelsCount = items.filter(i => i.mediaType === 'REEL').length;
  const imagesCount = items.filter(i => i.mediaType === 'IMAGE').length;

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #1e2638', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Instagram size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>DesiDreams Automation Hub</h1>
              <p style={{ fontSize: '14px', color: '#8e9bb2' }}>
                Auto-publishing to Instagram from Cloudinary ➔ Target: <a href="https://desidreams.fun" target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '600' }}>desidreams.fun ↗</a>
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#121722', border: '1px solid #253047', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ color: '#8e9bb2' }}>Cloud: <strong style={{ color: '#f0f4fc' }}>qtah71h2</strong></span>
          </div>

          <button
            onClick={fetchMedia}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1d2535',
              border: '1px solid #2e3a52',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.2s',
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync Media
          </button>
        </div>
      </header>

      {/* Status Alerts */}
      {statusMessage && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: statusMessage.type === 'success' ? '#0d2818' : statusMessage.type === 'error' ? '#2e1215' : '#14213d',
          border: `1px solid ${statusMessage.type === 'success' ? '#1b4d2e' : statusMessage.type === 'error' ? '#5c2229' : '#233d6b'}`,
          color: statusMessage.type === 'success' ? '#4ade80' : statusMessage.type === 'error' ? '#f87171' : '#60a5fa',
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontSize: '14px' }}>{statusMessage.text}</span>
        </div>
      )}

      {/* Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>TOTAL MEDIA QUEUED</span>
            <Layers size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{items.length}</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '4px' }}>Folder: &quot;desi dreams sober&quot;</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>REELS / VIDEOS</span>
            <Film size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{reelsCount}</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '4px' }}>9:16 Video Format</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>IMAGES / POSTS</span>
            <ImageIcon size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{imagesCount}</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '4px' }}>Square & Portrait</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>VERCEL CRON SCHEDULE</span>
            <Clock size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>3x Daily (Active)</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '6px' }}>12:00 PM • 4:30 PM • 8:30 PM IST</div>
        </div>
      </section>

      {/* Filter Tabs & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#121620', padding: '4px', borderRadius: '8px', border: '1px solid #1e2638' }}>
          {(['ALL', 'REEL', 'IMAGE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: filter === type ? '#253047' : 'transparent',
                color: filter === type ? '#ffffff' : '#8e9bb2',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {type === 'ALL' ? `All (${items.length})` : type === 'REEL' ? `Reels (${reelsCount})` : `Images (${imagesCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8e9bb2' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Scanning and loading assets from Cloudinary...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#121620', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <p style={{ color: '#8e9bb2' }}>No media items found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#121620',
                border: '1px solid #1e2638',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Media Preview Box */}
              <div style={{ height: '220px', background: '#0a0d14', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.mediaType === 'IMAGE' ? (
                  <img
                    src={item.secureUrl}
                    alt={item.publicId}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.secureUrl}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    preload="metadata"
                  />
                )}

                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: item.mediaType === 'REEL' ? 'rgba(236, 72, 153, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {item.mediaType === 'REEL' ? <Film size={12} /> : <ImageIcon size={12} />}
                  {item.mediaType}
                </div>

                <a
                  href={item.secureUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                  }}
                  title="Open full resolution in Cloudinary"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4fc', marginBottom: '8px', wordBreak: 'break-all' }}>
                    {item.publicId}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#8e9bb2',
                    background: '#0a0c10',
                    border: '1px solid #1a202c',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    maxHeight: '80px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-line',
                  }}>
                    {item.caption}
                  </div>
                </div>

                <button
                  onClick={() => handlePublish(item)}
                  disabled={publishing === item.id}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={14} />
                  {publishing === item.id ? 'Sending to Blotato...' : 'Publish to Instagram'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
