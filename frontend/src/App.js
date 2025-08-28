import React, { useState } from "react";
import Plot from 'react-plotly.js';
import "./App.css";

// Mapping SDG label ke deskripsi
const SDG_LABELS = {
  '1': 'GOAL 1: No Poverty',
  '2': 'GOAL 2: Zero Hunger',
  '3': 'GOAL 3: Good Health and Well-being',
  '4': 'GOAL 4: Quality Education',
  '5': 'GOAL 5: Gender Equality',
  '6': 'GOAL 6: Clean Water and Sanitation',
  '7': 'GOAL 7: Affordable and Clean Energy',
  '8': 'GOAL 8: Decent Work and Economic Growth',
  '9': 'GOAL 9: Industry, Innovation and Infrastructure',
  '10': 'GOAL 10: Reduced Inequality',
  '11': 'GOAL 11: Sustainable Cities and Communities',
  '12': 'GOAL 12: Responsible Consumption and Production',
  '13': 'GOAL 13: Climate Action',
  '14': 'GOAL 14: Life Below Water',
  '15': 'GOAL 15: Life on Land',
  '16': 'GOAL 16: Peace, Justice and Strong Institutions',
};

function App() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [textResult, setTextResult] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file dulu!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleTextPredict = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return alert("Masukkan teks terlebih dulu");
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });
      const data = await res.json();
      setTextResult(data);
    } catch (err) {
      console.error("Predict error:", err);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <img src="/Padang_State_University_logo.png" alt="logo" className="logo" />
        <h1>SDGs Label Detector</h1>
      </header>

      {/* Main */}
      <main className="main">
        <div className="white-box">
          <div className="welcome-section">
            <h2>Welcome to SDGs Label Detector</h2>
            <p>Choose your preferred input method to detect Sustainable Development Goals</p>
          </div>

          {/* Option Cards */}
          <div className="option-cards">
            <div className="card" onClick={() => setActiveSection("text")}>
              <div className="card-icon">📝</div>
              <h3>Start Text Analysis</h3>
            </div>
            <div className="card" onClick={() => setActiveSection("upload")}>
              <div className="card-icon">📄</div>
              <h3>Upload Document</h3>
            </div>
          </div>

          {/* Text Section */}
          {activeSection === "text" && (
            <div className="text-input-section">
              <h3>Quick Text Analysis</h3>
              <form onSubmit={handleTextPredict}>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter your text here..."
                  required
                />
                <button type="submit" className="analyze-button">Analyze</button>
              </form>
              {textResult && (
                <div style={{ marginTop: '0.75rem' }}>
                  <h4>Hasil Prediksi Teks</h4>
                  {typeof textResult.predicted_labels !== 'undefined' ? (
                    (() => {
                      // sort by probability descending
                      const probEntries = Object.entries(textResult.probabilities || {});
                      const sorted = probEntries.sort((a, b) => b[1] - a[1]);
                      const top3 = sorted.slice(0, 3);
                      return (
                        <>
                          <p>Top 3 Predicted Labels:</p>
                          <ol style={{ fontWeight: 'bold', marginBottom: 8 }}>
                            {top3.map(([label, prob], idx) => (
                              <li key={label}>{label} ({prob.toFixed(3)})</li>
                            ))}
                          </ol>
                          <div style={{ maxWidth: 700 }}>
                            <Plot
                              data={[{
                                type: 'bar',
                                orientation: 'h',
                                x: sorted.map(([, v]) => v),
                                y: sorted.map(([k]) => SDG_LABELS[k] || k),
                                marker: { color: '#2563eb' },
                                hovertemplate: '%{y}: %{x:.3f}<extra></extra>',
                              }]}
                              layout={{
                                title: '',
                                xaxis: {
                                  title: 'Likelihood of SDG',
                                  range: [0, 1],
                                  showgrid: true,
                                  gridcolor: '#e5e7eb',
                                  zeroline: false,
                                  tickformat: '.2f',
                                  titlefont: { size: 16 },
                                },
                                yaxis: {
                                  title: 'Sustainable development goals (SDG)',
                                  automargin: true,
                                  tickfont: { size: 13 },
                                },
                                height: 520,
                                margin: { l: 220, r: 30, t: 20, b: 40 },
                                plot_bgcolor: '#f9fafb',
                                paper_bgcolor: '#fff',
                              }}
                              config={{ displayModeBar: false }}
                            />
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <p style={{ fontWeight: 500 }}>Top Features per Label:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                              {Object.entries(textResult.top_features || {}).map(([label, feats]) => (
                                <div key={label} style={{ minWidth: 120, background: '#f3f4f6', borderRadius: 8, padding: 8 }}>
                                  <b>{label}</b>
                                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {(feats || []).slice(0, 5).map((f, i) => <li key={i}>{f}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()
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
            </div>
          )}

          {/* Upload Section */}
          {activeSection === "upload" && (
            <div className="upload-section">
              <h3>Upload Document</h3>
              <form onSubmit={handleUpload}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="pretty-file-input"
                  required
                />
                <button type="submit" className="upload-button">🚀 Upload & Analyze</button>
              </form>
              {result && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Hasil Upload</h4>
                  <p>Filename: {result.filename}</p>
                  {result.result && (
                    typeof result.result.predicted_labels !== 'undefined' ? (() => {
                      const probEntries = Object.entries(result.result.probabilities || {});
                      const sorted = probEntries.sort((a, b) => b[1] - a[1]);
                      const top3 = sorted.slice(0, 3);
                      return (
                        <>
                          <p>Top 3 Predicted Labels:</p>
                          <ol style={{ fontWeight: 'bold', marginBottom: 8 }}>
                            {top3.map(([label, prob], idx) => (
                              <li key={label}>{label} ({prob.toFixed(3)})</li>
                            ))}
                          </ol>
                          <div style={{ maxWidth: 700 }}>
                            <Plot
                              data={[{
                                type: 'bar',
                                orientation: 'h',
                                x: sorted.map(([, v]) => v),
                                y: sorted.map(([k]) => SDG_LABELS[k] || k),
                                marker: { color: '#2563eb' },
                                hovertemplate: '%{y}: %{x:.3f}<extra></extra>',
                              }]}
                              layout={{
                                title: '',
                                xaxis: {
                                  title: 'Likelihood of SDG',
                                  range: [0, 1],
                                  showgrid: true,
                                  gridcolor: '#e5e7eb',
                                  zeroline: false,
                                  tickformat: '.2f',
                                  titlefont: { size: 16 },
                                },
                                yaxis: {
                                  title: 'Sustainable development goals (SDG)',
                                  automargin: true,
                                  tickfont: { size: 13 },
                                },
                                height: 520,
                                margin: { l: 220, r: 30, t: 20, b: 40 },
                                plot_bgcolor: '#f9fafb',
                                paper_bgcolor: '#fff',
                              }}
                              config={{ displayModeBar: false }}
                            />
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <p style={{ fontWeight: 500 }}>Top Features per Label:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                              {Object.entries(result.result.top_features || {}).map(([label, feats]) => (
                                <div key={label} style={{ minWidth: 120, background: '#f3f4f6', borderRadius: 8, padding: 8 }}>
                                  <b>{label}</b>
                                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {(feats || []).slice(0, 5).map((f, i) => <li key={i}>{f}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })() : (
                      <>
                        <p>Prediction (relevan ke SDG): <b>{result.result.prediction ? 'Ya' : 'Tidak'}</b></p>
                        <p>Probability: <b>{(result.result.probability || 0).toFixed(3)}</b></p>
                        <p>Faktor (top features):</p>
                        <ul>
                          {(result.result.top_features || []).map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 SDGs Label Detector | Universitas Negeri Padang</p>
      </footer>
    </div>
  );
}

export default App;
