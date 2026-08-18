'use client';

import React, { useEffect, useState } from 'react';
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Sparkles, 
  RefreshCw, 
  Send, 
  Film, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers,
  AlertCircle,
  Share2,
  Rocket
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
  const [publishing, setPublishing] = useState<{ id: string; platform: string } | null>(null);
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

  const handlePublish = async (item: MediaItem, platform = 'all') => {
    setPublishing({ id: item.id, platform });
    setStatusMessage(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, platform }),
      });
      const data = await res.json();
      if (data.success) {
        const platformsStr = data.publishedPlatforms ? data.publishedPlatforms.join(', ').toUpperCase() : platform.toUpperCase();
        setStatusMessage({ 
          type: 'success', 
          text: `🎉 Successfully dispatched "${item.publicId}" to ${platformsStr}!` 
        });
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: data.error || data.warning || 'Failed to publish via Blotato.' 
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', borderBottom: '1px solid #1e2638', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Instagram size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>DesiDreams Dual-Schedule Automation Hub</h1>
              <p style={{ fontSize: '14px', color: '#8e9bb2' }}>
                Reels @ 5 PM • Images @ 7 PM ➔ Website: <a href="https://desidreams.fun" target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '600' }}>desidreams.fun ↗</a>
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync Cloudinary
          </button>
        </div>
      </header>

      {/* Connected Channels Bar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Instagram size={18} color="#ec4899" />
          <div>
            <div style={{ fontSize: '12px', color: '#8e9bb2' }}>Instagram (65790)</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4fc' }}>@desi_dreams_fun</div>
          </div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Youtube size={18} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', color: '#8e9bb2' }}>YouTube Shorts (47058)</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4fc' }}>Desi Dreams</div>
          </div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Twitter size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '12px', color: '#8e9bb2' }}>X / Twitter (24443)</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4fc' }}>@desiDreams_fun</div>
          </div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Share2 size={18} color="#e11d48" />
          <div>
            <div style={{ fontSize: '12px', color: '#8e9bb2' }}>Pinterest (9234)</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f4fc' }}>desidreamsfun</div>
          </div>
        </div>
      </section>

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

      {/* Metric & Schedule Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>TOTAL MEDIA READY</span>
            <Layers size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{items.length}</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '4px' }}>{reelsCount} Reels + {imagesCount} Images</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '600' }}>REELS SCHEDULE</span>
            <Film size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Daily 5:00 PM IST</div>
          <div style={{ fontSize: '12px', color: '#f43f5e', marginTop: '4px' }}>Starts Aug 24 (In 5 Days)</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>IMAGES SCHEDULE</span>
            <ImageIcon size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Daily 7:00 PM IST</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Starts TODAY (Aug 19)</div>
        </div>

        <div style={{ background: '#121620', border: '1px solid #1e2638', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8e9bb2', fontWeight: '500' }}>HASHTAGS & CTA</span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>Max 5 Tags Active</div>
          <div style={{ fontSize: '12px', color: '#62728d', marginTop: '6px' }}>Targeting desidreams.fun</div>
        </div>
      </section>

      {/* Filter Tabs */}
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
              {type === 'ALL' ? `All (${items.length})` : type === 'REEL' ? `Videos/Reels (${reelsCount})` : `Images (${imagesCount})`}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
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
              <div style={{ height: '230px', background: '#0a0d14', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                {/* Platform Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Master Button: Post to All Platforms */}
                  <button
                    onClick={() => handlePublish(item, 'all')}
                    disabled={publishing?.id === item.id}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Rocket size={15} />
                    {publishing?.id === item.id && publishing.platform === 'all' 
                      ? 'Syndicating Across Channels...' 
                      : item.mediaType === 'REEL' ? '🚀 Post to All Platforms' : '🚀 Post to All Platforms'}
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    <button
                      onClick={() => handlePublish(item, 'instagram')}
                      disabled={publishing?.id === item.id}
                      style={{
                        padding: '6px',
                        background: '#1d2535',
                        border: '1px solid #2e3a52',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Instagram size={12} color="#ec4899" />
                      Instagram
                    </button>

                    <button
                      onClick={() => handlePublish(item, 'pinterest')}
                      disabled={publishing?.id === item.id}
                      style={{
                        padding: '6px',
                        background: '#1d2535',
                        border: '1px solid #2e3a52',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Share2 size={12} color="#e11d48" />
                      Pinterest
                    </button>

                    <button
                      onClick={() => handlePublish(item, 'twitter')}
                      disabled={publishing?.id === item.id}
                      style={{
                        padding: '6px',
                        background: '#1d2535',
                        border: '1px solid #2e3a52',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Twitter size={12} color="#38bdf8" />
                      X (Twitter)
                    </button>
                  </div>

                  {item.mediaType === 'REEL' && (
                    <button
                      onClick={() => handlePublish(item, 'youtube')}
                      disabled={publishing?.id === item.id}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#1d2535',
                        border: '1px solid #2e3a52',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Youtube size={12} color="#ef4444" />
                      Post Only to YouTube Shorts
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
