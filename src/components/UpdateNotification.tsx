import { useEffect, useState } from 'react';
import './UpdateNotification.css';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
}

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for update events
    window.api.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setError(null);
    });

    window.api.onUpdateDownloaded((info) => {
      setUpdateDownloaded(true);
      setDownloading(false);
      setUpdateInfo(info);
    });

    window.api.onUpdateProgress((progressInfo) => {
      setProgress(progressInfo);
    });

    window.api.onUpdateError((errorMsg) => {
      setError(errorMsg);
      setDownloading(false);
    });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      await window.api.downloadUpdate();
    } catch (err) {
      setError('Failed to download update');
      setDownloading(false);
    }
  };

  const handleInstall = () => {
    window.api.installUpdate();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    setUpdateDownloaded(false);
    setError(null);
  };

  if (!updateAvailable && !updateDownloaded && !error) {
    return null;
  }

  return (
    <div className="update-notification">
      {error && (
        <div className="update-card update-error">
          <div className="update-icon">⚠️</div>
          <div className="update-content">
            <h3>Update Error</h3>
            <p>{error}</p>
          </div>
          <button className="update-btn-secondary" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      )}

      {updateDownloaded && !error && (
        <div className="update-card update-ready">
          <div className="update-icon">✨</div>
          <div className="update-content">
            <h3>Update Ready</h3>
            <p>
              Version {updateInfo?.version} has been downloaded. Restart to apply the update.
            </p>
          </div>
          <div className="update-actions">
            <button className="update-btn-secondary" onClick={handleDismiss}>
              Later
            </button>
            <button className="update-btn-primary" onClick={handleInstall}>
              Restart Now
            </button>
          </div>
        </div>
      )}

      {updateAvailable && !updateDownloaded && !downloading && !error && (
        <div className="update-card update-available">
          <div className="update-icon">🎉</div>
          <div className="update-content">
            <h3>Update Available</h3>
            <p>
              Version {updateInfo?.version} is available. Would you like to download it?
            </p>
          </div>
          <div className="update-actions">
            <button className="update-btn-secondary" onClick={handleDismiss}>
              Not Now
            </button>
            <button className="update-btn-primary" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
      )}

      {downloading && !error && (
        <div className="update-card update-downloading">
          <div className="update-icon">
            <div className="spinner"></div>
          </div>
          <div className="update-content">
            <h3>Downloading Update</h3>
            {progress && (
              <div className="update-progress" style={{ '--progress': `${progress.percent}%` } as React.CSSProperties}>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <p className="progress-text">
                  {progress.percent.toFixed(1)}% ({(progress.transferred / 1024 / 1024).toFixed(1)} MB / {(progress.total / 1024 / 1024).toFixed(1)} MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
