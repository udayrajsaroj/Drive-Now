import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the scanner instance
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Back camera use karega
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success: Scan hote hi camera release karo
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              onScanSuccess(decodedText);
            }).catch(err => console.error("Stop failed", err));
          },
          (errorMessage) => {
            // Silent errors to keep console clean
          }
        );
      } catch (err) {
        console.error("Scanner failed to start", err);
      }
    };

    startScanner();

    // 2. Cleanup: Modal band hote hi camera kill karna compulsory hai
    return () => {
      if (scannerRef.current) {
        // Agar scanning chal rahi hai toh stop karo, warna sirf clear karo
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop()
            .then(() => scannerRef.current.clear())
            .catch((err) => console.log("Cleanup silent fail", err));
        } else {
          try { scannerRef.current.clear(); } catch (e) {}
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>Verify Booking QR</h3>
          <button 
            onClick={onClose} 
            style={{ 
                cursor: 'pointer', border: 'none', background: '#f1f5f9', 
                borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem' 
            }}
          >
            &times;
          </button>
        </div>
        
        {/* Is div mein camera render hoga */}
        <div id="reader" style={{ 
            width: '100%', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '2px solid #e2e8f0',
            backgroundColor: '#000' 
        }}></div>
        
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem', textAlign: 'center' }}>
          Align the QR code within the frame. It will automatically verify and close once detected.
        </p>
      </div>
    </div>
  );
};

// Styles (Already good, just keeping them for reference)
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
};

export default QRScannerModal;