import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../features/admin-analytics/api';
import { AdminPageHeader } from './ui';
import './SocialPage.css';

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 2;

const SocialPage = () => {
  const [photos, setPhotos] = useState([]); // [{ file, previewUrl, name }]
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    return () => photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS);
    photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPhotos(files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: ''
    })));
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if ((e.target.files || []).length > MAX_PHOTOS) {
      setErrorMsg(`Only the first ${MAX_PHOTOS} photos were kept.`);
    }
  };

  const handleNameChange = (index, value) => {
    setPhotos(prev => prev.map((p, i) => (i === index ? { ...p, name: value } : p)));
  };

  const handleSubmit = async () => {
    if (photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) return;
    setStatus('uploading');
    setErrorMsg('');

    try {
      const formData = new FormData();
      photos.forEach(p => formData.append('photos', p.file));
      formData.append('names', JSON.stringify(photos.map(p => p.name.trim())));

      const data = await adminFetch('/tiktok-upload/submit', { method: 'POST', formData });
      setResult(data);
      setStatus('success');
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.status === 401 || err.status === 403) {
        setErrorMsg('Session expired or not authorized. Please sign in again.');
      } else if (err.status) {
        setErrorMsg(err.message);
        // Dispatch failed but the photos are saved — keep the batch id visible.
        if (err.data?.batch_id) setResult(err.data);
      } else {
        setErrorMsg('Upload failed. Check your connection and try again.');
      }
      setStatus('error');
    }
  };

  const canSubmit = photos.length >= MIN_PHOTOS && photos.length <= MAX_PHOTOS && status !== 'uploading';

  return (
    <div className="content-upload">
      <AdminPageHeader
        title="Social Media"
        description={`Upload ${MIN_PHOTOS}-${MAX_PHOTOS} photos of your dishes. The pipeline writes the recipes, builds the carousel, and sends a draft to your TikTok inbox.`}
      />
      <div className="content-upload__card">

        {status !== 'success' && (
          <>
            <label className="content-upload__picker">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFilesSelected}
                disabled={status === 'uploading'}
              />
              {photos.length === 0 ? 'Tap to choose photos' : `${photos.length} photo${photos.length > 1 ? 's' : ''} selected — tap to change`}
            </label>

            {photos.map((photo, i) => (
              <div className="content-upload__photo-card" key={photo.previewUrl}>
                <img src={photo.previewUrl} alt={`Dish ${i + 1}`} className="content-upload__thumb" />
                <input
                  type="text"
                  className="content-upload__name-input"
                  placeholder="Dish name (optional)"
                  value={photo.name}
                  maxLength={80}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  disabled={status === 'uploading'}
                />
              </div>
            ))}

            {photos.length === 1 && (
              <p className="content-upload__hint">Add at least one more photo ({MIN_PHOTOS} minimum).</p>
            )}

            <button
              className="content-upload__submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {status === 'uploading' ? 'Uploading…' : 'Create TikTok draft'}
            </button>
          </>
        )}

        {errorMsg && <div className="content-upload__error">{errorMsg}</div>}

        {status === 'error' && result?.batch_id && (
          <div className="content-upload__error-detail">
            Your photos are saved (batch <code>{result.batch_id}</code>).
            {result.hint ? ` ${result.hint}` : ''}
          </div>
        )}

        {status === 'success' && result && (
          <div className="content-upload__success">
            <div className="content-upload__success-icon">✓</div>
            <p>{result.message}</p>
            <p className="content-upload__batch">Batch: <code>{result.batch_id}</code></p>
            {result.dispatched && result.actions_url && (
              <a href={result.actions_url} target="_blank" rel="noopener noreferrer">
                Watch the pipeline run
              </a>
            )}
            <button
              className="content-upload__again"
              onClick={() => { setPhotos([]); setStatus('idle'); setResult(null); setErrorMsg(''); }}
            >
              Upload another post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
