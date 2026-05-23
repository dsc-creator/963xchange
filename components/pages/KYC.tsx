'use client'

import { useState, useRef } from 'react'

// List of countries
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", 
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", 
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", 
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", 
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", 
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", 
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
]

// Document types
const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport', icon: '🛂' },
  { id: 'national_id', label: 'National ID Card', icon: '🪪' },
  { id: 'drivers_license', label: "Driver's License", icon: '🚗' },
  { id: 'residence_permit', label: 'Residence Permit', icon: '🏠' },
]

interface KYCProps {
  navigate: (page: 'home' | 'login' | 'signup' | 'dashboard' | 'trade' | 'kyc') => void
}

export default function KYC({ navigate }: KYCProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Country, 2: Document Type, 3: Upload
  const [country, setCountry] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFrontImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFrontPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!frontImage) {
      alert('Please upload the front of your ID')
      return
    }
    
    setLoading(true)

    // Simulate verification process
    setTimeout(() => {
      localStorage.setItem('kyc_completed', 'true')
      localStorage.setItem('kyc_country', country)
      localStorage.setItem('kyc_document_type', documentType)
      alert("✅ KYC Completed Successfully!")
      navigate('dashboard')
    }, 7000)
  }

  const canProceedToStep2 = country !== ''
  const canProceedToStep3 = documentType !== ''
  const canSubmit = frontImage !== null

  const needsBackImage = documentType === 'national_id' || documentType === 'drivers_license'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#070b14',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: '#111827',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top gradient line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #00d4ff, #00e5a0, transparent)'
        }} />

        {/* Logo */}
        <button onClick={() => navigate('home')} style={{ 
          textDecoration: 'none', 
          display: 'inline-block', 
          marginBottom: 24,
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            <span style={{ color: 'var(--text-primary)' }}>369</span>
            <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>x</span>
            <span style={{ color: 'var(--text-primary)' }}>change</span>
          </div>
        </button>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: s <= step ? 'linear-gradient(90deg, #00d4ff, #00e5a0)' : '#334155',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          {step === 1 && 'Select Your Country'}
          {step === 2 && 'Choose Document Type'}
          {step === 3 && 'Upload Your ID'}
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>
          {step === 1 && 'Select your country of residence to continue'}
          {step === 2 && 'Choose the type of ID document you want to upload'}
          {step === 3 && 'Take a clear photo or upload an image of your document'}
        </p>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{
              width: 50, height: 50, margin: '0 auto 20px',
              border: '5px solid #00d4ff',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: 16, color: '#94a3b8' }}>Verifying your documents...</p>
          </div>
        ) : (
          <>
            {/* Step 1: Country Selection */}
            {step === 1 && (
              <div>
                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1e2937',
                    border: '1px solid #475569',
                    borderRadius: 10,
                    color: 'white',
                    fontSize: 15,
                    marginBottom: 16,
                    outline: 'none'
                  }}
                />
                
                {/* Country list */}
                <div style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid #334155',
                  borderRadius: 10,
                  marginBottom: 24
                }}>
                  {filteredCountries.map(c => (
                    <button
                      key={c}
                      onClick={() => setCountry(c)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: country === c ? 'rgba(0,212,255,0.15)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid #1e2937',
                        color: country === c ? '#00d4ff' : 'white',
                        fontSize: 15,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s'
                      }}
                    >
                      <span>{c}</span>
                      {country === c && <span style={{ color: '#00e5a0' }}>✓</span>}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  style={{
                    width: '100%',
                    padding: 16,
                    background: canProceedToStep2 
                      ? 'linear-gradient(135deg, #00d4ff, #00e5a0)' 
                      : '#334155',
                    color: canProceedToStep2 ? '#000' : '#666',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 17,
                    cursor: canProceedToStep2 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue →
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('kyc_skipped', 'true')
                    navigate('dashboard')
                  }}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: 14,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Skip for now — explore in read-only mode
                </button>
              </div>
            )}

            {/* Step 2: Document Type Selection */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {DOCUMENT_TYPES.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setDocumentType(doc.id)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        background: documentType === doc.id ? 'rgba(0,212,255,0.15)' : '#1e2937',
                        border: documentType === doc.id ? '2px solid #00d4ff' : '1px solid #475569',
                        borderRadius: 12,
                        color: 'white',
                        fontSize: 16,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{doc.icon}</span>
                      <span style={{ fontWeight: 600 }}>{doc.label}</span>
                      {documentType === doc.id && (
                        <span style={{ marginLeft: 'auto', color: '#00e5a0' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: 16,
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #475569',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    style={{
                      flex: 2,
                      padding: 16,
                      background: canProceedToStep3 
                        ? 'linear-gradient(135deg, #00d4ff, #00e5a0)' 
                        : '#334155',
                      color: canProceedToStep3 ? '#000' : '#666',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 17,
                      cursor: canProceedToStep3 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {step === 3 && (
              <div>
                {/* Selected info */}
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: 8,
                  marginBottom: 24,
                  fontSize: 14
                }}>
                  <strong>{country}</strong> • {DOCUMENT_TYPES.find(d => d.id === documentType)?.label}
                </div>

                {/* Front image upload */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#94a3b8',
                    marginBottom: 8 
                  }}>
                    Front of Document *
                  </label>
                  
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFrontImageChange}
                    style={{ display: 'none' }}
                  />
                  
                  {frontPreview ? (
                    <div style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '2px solid #00d4ff'
                    }}>
                      <img 
                        src={frontPreview} 
                        alt="Front of ID" 
                        style={{ 
                          width: '100%', 
                          height: 180, 
                          objectFit: 'cover' 
                        }} 
                      />
                      <button
                        onClick={() => {
                          setFrontImage(null)
                          setFrontPreview(null)
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.7)',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: 16
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => frontInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '40px 20px',
                        background: '#1e2937',
                        border: '2px dashed #475569',
                        borderRadius: 12,
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <span style={{ fontSize: 32 }}>📤</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>Click to upload front</span>
                      <span style={{ fontSize: 12 }}>JPG, PNG or PDF up to 10MB</span>
                    </button>
                  )}
                </div>

                {/* Back image upload (conditional) */}
                {needsBackImage && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: '#94a3b8',
                      marginBottom: 8 
                    }}>
                      Back of Document (Optional)
                    </label>
                    
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleBackImageChange}
                      style={{ display: 'none' }}
                    />
                    
                    {backPreview ? (
                      <div style={{
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '2px solid #00e5a0'
                      }}>
                        <img 
                          src={backPreview} 
                          alt="Back of ID" 
                          style={{ 
                            width: '100%', 
                            height: 180, 
                            objectFit: 'cover' 
                          }} 
                        />
                        <button
                          onClick={() => {
                            setBackImage(null)
                            setBackPreview(null)
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 16
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => backInputRef.current?.click()}
                        style={{
                          width: '100%',
                          padding: '40px 20px',
                          background: '#1e2937',
                          border: '2px dashed #475569',
                          borderRadius: 12,
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <span style={{ fontSize: 32 }}>📤</span>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>Click to upload back</span>
                        <span style={{ fontSize: 12 }}>JPG, PNG or PDF up to 10MB</span>
                      </button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      padding: 16,
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #475569',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{
                      flex: 2,
                      padding: 16,
                      background: canSubmit 
                        ? 'linear-gradient(135deg, #00d4ff, #00e5a0)' 
                        : '#334155',
                      color: canSubmit ? '#000' : '#666',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 17,
                      cursor: canSubmit ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Complete Verification
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Security note */}
        <div style={{
          marginTop: 32,
          padding: '16px',
          background: 'rgba(0,229,160,0.08)',
          border: '1px solid rgba(0,229,160,0.2)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Your data is secure
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              We use bank-level encryption to protect your information. Your documents are processed securely and never shared with third parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
