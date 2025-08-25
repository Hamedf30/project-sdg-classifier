import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }


function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textResult, setTextResult] = useState(null);
  // Hanya logreg/tfidf

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file dulu!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      // backend returns { filename, result }
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleTextPredict = async () => {
    if (!textInput || textInput.trim() === '') return alert('Masukkan teks terlebih dulu');
    try {
      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });
      const data = await res.json();
      setTextResult(data);
    } catch (err) {
      console.error('Predict error:', err);
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Uji Koneksi ke Backend / Klasifikasi</h1>


      <section style={{ marginBottom: '1.5rem' }}>
        <h2>1) Prediksi dari Teks</h2>
  {/* Hanya logreg/tfidf */}
        <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={6} style={{ width: '100%' }} placeholder="Tempel atau ketik teks jurnal di sini..." />
        <button onClick={handleTextPredict} style={{ marginTop: '0.5rem' }}>Prediksi Teks</button>

        {textResult && (
          <div style={{ marginTop: '0.75rem' }}>
            <h4>Hasil Prediksi Teks</h4>
            {/* multi-label response has predicted_labels & probabilities & top_features per label */}
            {typeof textResult.predicted_labels !== 'undefined' ? (
              <>
                <p>Predicted labels: <b>{(textResult.predicted_labels || []).join(', ') || 'Tidak ada'}</b></p>
                <div>
                  <p>Probabilities:</p>
                  <ul>
                    {Object.entries(textResult.probabilities || {}).map(([k, v]) => (
                      <li key={k}>{k}: {v.toFixed ? v.toFixed(3) : String(v)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>Faktor (top features):</p>
                  {/* top_features may be an object {label: [feats]} or an array */}
                  {Array.isArray(textResult.top_features) ? (
                    <ul>{textResult.top_features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  ) : (
                    <div>
                      {Object.entries(textResult.top_features || {}).map(([label, feats]) => (
                        <div key={label} style={{ marginBottom: '0.5rem' }}>
                          <b>{label}</b>
                          <ul>
                            {(feats || []).map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // legacy single-label response
              <>
                <p>Prediction (relevan ke SDG): <b>{textResult.prediction ? 'Ya' : 'Tidak'}</b></p>
                <p>Probability: <b>{(textResult.probability || 0).toFixed(3)}</b></p>
                <div>
                  <p>Faktor (top features):</p>
                  <ul>
                    {(textResult.top_features || []).map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>2) Upload Jurnal (PDF)</h2>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: '0.5rem' }}>Upload</button>

        {result && (
          <div style={{ marginTop: '20px' }}>
            <h4>Hasil Upload</h4>
            <p>Filename: {result.filename}</p>
            {result.result && (
              <>
                {typeof result.result.predicted_labels !== 'undefined' ? (
                  <>
                    <p>Predicted labels: <b>{(result.result.predicted_labels || []).join(', ') || 'Tidak ada'}</b></p>
                    <div>
                      <p>Probabilities:</p>
                      <ul>
                        {Object.entries(result.result.probabilities || {}).map(([k, v]) => (
                          <li key={k}>{k}: {v.toFixed ? v.toFixed(3) : String(v)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p>Faktor (top features):</p>
                      {Array.isArray(result.result.top_features) ? (
                        <ul>{result.result.top_features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                      ) : (
                        <div>
                          {Object.entries(result.result.top_features || {}).map(([label, feats]) => (
                            <div key={label} style={{ marginBottom: '0.5rem' }}>
                              <b>{label}</b>
                              <ul>
                                {(feats || []).map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p>Prediction (relevan ke SDG): <b>{result.result.prediction ? 'Ya' : 'Tidak'}</b></p>
                    <p>Probability: <b>{(result.result.probability || 0).toFixed(3)}</b></p>
                    <p>Faktor (top features):</p>
                    <ul>
                      {(result.result.top_features || []).map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


export default App;
