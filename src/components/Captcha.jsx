import { useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../api/api';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
const ROTATIONS = ['-5deg', '5deg', '-8deg', '8deg', '-3deg', '3deg', '0deg'];

const Captcha = ({ onCaptchaChange }) => {
  const [captchaId, setCaptchaId] = useState('');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const cbRef = useRef(onCaptchaChange);
  cbRef.current = onCaptchaChange;

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authAPI.getCaptcha();
      setCaptchaId(data.captcha_id);
      setCode(data.code);
    } catch {
      setCode('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  useEffect(() => {
    cbRef.current && cbRef.current({ captcha_id: captchaId, captcha_answer: input });
  }, [captchaId, input]);

  const handleRefresh = (e) => {
    e.preventDefault();
    setInput('');
    loadCaptcha();
  };

  return (
    <div className="d-flex flex-column align-items-start w-100">
      <label className="mb-2 fs-4">Security Check:</label>
      <div className="d-flex align-items-center gap-2 w-100">
        <div className="position-relative px-4 py-3 border rounded overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
            minWidth: 180,
            userSelect: 'none',
          }}>
          {loading ? (
            <span className="text-muted">Loading...</span>
          ) : (
            <div className="d-flex align-items-center justify-content-center gap-1" style={{ letterSpacing: 6 }}>
              {code.split('').map((char, i) => (
                <span key={i}
                  style={{
                    color: COLORS[i % COLORS.length],
                    transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})`,
                    display: 'inline-block',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    fontStyle: i % 2 === 0 ? 'normal' : 'italic',
                  }}>
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={handleRefresh} title="New code">
          &#x21bb;
        </button>
      </div>
      <input
        className="p-3 py-2 outline-0 w-100 border-gray border-05 mt-2"
        type="text"
        placeholder="Enter the code above"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};

export default Captcha;
