import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './ContentUploadPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MAX_PHOTOS = 4;
const MIN_PHOTOS = 2;

const ContentUploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]); // [{ file, previewUrl, name }]
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user?.isAdmin) return null;

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

      const token = localStorage.getItem('fridgy_token');
      const res = await fetch(`${API_BASE_URL}/tiktok-upload/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
        setStatus('success');
      } else if (res.status === 401 || res.status === 403) {
        setErrorMsg('Session expired or not authorized. Please sign in again.');
        setStatus('error');
      } else {
        setErrorMsg(data.error || `Upload failed (${res.status})`);
        if (data.batch_id) setResult(data); // dispatch failed but photos are saved
        setStatus('error');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg('Upload failed. Check your connection and try again.');
      setStatus('error');
    }
  };

  const canSubmit = photos.length >= MIN_PHOTOS && photos.length <= MAX_PHOTOS && status !== 'uploading';

  return (
    <div className="content-upload">
      <div className="content-upload__card">
        <h1 className="content-upload__title">TikTok Photo Post</h1>
        <p className="content-upload__subtitle">
          Upload {MIN_PHOTOS}-{MAX_PHOTOS} photos of your dishes. The pipeline writes the
          recipes, builds the carousel, and sends a draft to your TikTok inbox.
        </p>

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

export default ContentUploadPage;
