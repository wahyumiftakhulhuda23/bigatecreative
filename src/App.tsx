/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Clock, 
  Layers, 
  Users, 
  Play, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  FileSpreadsheet, 
  PlusCircle, 
  HelpCircle,
  Smartphone,
  Briefcase,
  User,
  MessageSquare,
  UploadCloud,
  RefreshCw
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Test Connection to Firestore as required by SKILL.md
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// ============================================================================
// DEFAULT INITIALIZATION DATA
// ============================================================================

const DEFAULT_TUTORIALS = [
  {
    id: "tut_1",
    title: "SOP Rendering Cycles & Octane di Blender Studio",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    division: "3D Animation"
  },
  {
    id: "tut_2",
    title: "Panduan Pemotongan Durasi & Keyframing Premiere Pro",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    division: "Video Editing"
  },
  {
    id: "tut_3",
    title: "SOP Penamaan Aset & Pengiriman File Klien",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    division: "Divisi Kreatif"
  }
];

const DEFAULT_PROJECT_SHEETS = [
  {
    id: "sheet_1",
    name: "Proyek Utama",
    columns: [
      { id: 'col_1', name: 'Nama Proyek', type: 'text' },
      { id: 'col_2', name: 'Deadline', type: 'date' },
      { id: 'col_3', name: 'Budget (Rp)', type: 'number' },
      { id: 'col_4', name: 'Status', type: 'text' }
    ],
    rows: [
      { id: 'row_1', data: { 'col_1': 'Rebranding Logo Bigate', 'col_2': '2026-07-15', 'col_3': 5000000, 'col_4': 'Dalam Proses' }, colors: { 'col_4': '#16a34a' } },
      { id: 'row_2', data: { 'col_1': 'Video Promosi 3D', 'col_2': '2026-08-01', 'col_3': 15000000, 'col_4': 'Belum Mulai' }, colors: { 'col_4': '#ea580c' } }
    ],
    createdAt: 1719859200000
  },
  {
    id: "sheet_2",
    name: "Sosmed Konten Juli",
    columns: [
      { id: 'col_1', name: 'Topik Konten', type: 'text' },
      { id: 'col_2', name: 'Tanggal Tayang', type: 'date' },
      { id: 'col_3', name: 'Penanggung Jawab', type: 'text' }
    ],
    rows: [
      { id: 'row_1', data: { 'col_1': 'Behind the Scenes Rendering Animasi', 'col_2': '2026-07-05', 'col_3': 'Reyhan' }, colors: {} }
    ],
    createdAt: 1719859300000
  }
];

const DEFAULT_ACCOUNT_SHEETS = [
  {
    id: "acc_sheet_1",
    name: "Daftar Akun Utama",
    columns: [
      { id: 'col_1', name: 'Platform / Layanan', type: 'text' },
      { id: 'col_2', name: 'Username / Email', type: 'text' },
      { id: 'col_3', name: 'Sandi / Password', type: 'text' },
      { id: 'col_4', name: 'Keterangan', type: 'text' }
    ],
    rows: [
      { id: 'row_1', data: { 'col_1': 'Adobe Creative Cloud', 'col_2': 'design@bigate.id', 'col_3': 'BigateCC2026!', 'col_4': 'Akun Utama Tim Desain' }, colors: {} },
      { id: 'row_2', data: { 'col_1': 'Google Drive Storage', 'col_2': 'studio@bigate.id', 'col_3': 'BigateDrive99!', 'col_4': 'Akun Pengiriman File Client' }, colors: {} }
    ],
    createdAt: 1719859400000
  }
];

const DEFAULT_TEAM_MEMBERS = [
  {
    id: "team_1",
    name: "Reyhan Bigate",
    position: "Lead 3D Animator",
    phone: "081234567890",
    whatsapp: "081234567890",
    jobdesk: "Mengatur timeline project 3D studio, bertanggung jawab atas QC asset 3D rendering dan animasi berkualitas tinggi."
  },
  {
    id: "team_2",
    name: "Annisa Putri",
    position: "UI/UX & Graphic Designer",
    phone: "082345678901",
    whatsapp: "082345678901",
    jobdesk: "Merancang aset visual promosi, layout presentasi klien, brand identity, dan visual assets sosial media."
  }
];

// Helper function to adjust contrast text color dynamically (dark/light bg)
const getContrastColor = (hexcolor: string | undefined) => {
  if (!hexcolor || hexcolor === 'transparent') return '';
  const hex = hexcolor.replace("#", "");
  if (hex.length !== 6) return '';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#0f172a' : '#f8fafc';
};

// YouTube thumbnail utility
const getThumbnailUrl = (url: string) => {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) {
    const parts = url.split('embed/');
    if (parts[1]) {
      const id = parts[1].split(/[?#]/)[0];
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }
  }
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w320`;
  }
  return null;
};

// Seeding function
const checkAndSeedDatabase = async () => {
  // Check tutorials
  try {
    const tutSnap = await getDoc(doc(db, 'tutorials', 'tut_1'));
    if (!tutSnap.exists()) {
      for (const tut of DEFAULT_TUTORIALS) {
        await setDoc(doc(db, 'tutorials', tut.id), {
          title: tut.title,
          url: tut.url,
          division: tut.division
        });
      }
    }

    // Check sheets
    const sheetSnap = await getDoc(doc(db, 'sheets', 'sheet_1'));
    if (!sheetSnap.exists()) {
      for (const sheet of DEFAULT_PROJECT_SHEETS) {
        await setDoc(doc(db, 'sheets', sheet.id), {
          name: sheet.name,
          columns: sheet.columns,
          rows: sheet.rows,
          createdAt: sheet.createdAt
        });
      }
    }

    // Check account sheets
    const accSnap = await getDoc(doc(db, 'account_sheets', 'acc_sheet_1'));
    if (!accSnap.exists()) {
      for (const sheet of DEFAULT_ACCOUNT_SHEETS) {
        await setDoc(doc(db, 'account_sheets', sheet.id), {
          name: sheet.name,
          columns: sheet.columns,
          rows: sheet.rows,
          createdAt: sheet.createdAt
        });
      }
    }

    // Check team members
    const teamSnap = await getDoc(doc(db, 'team_members', 'team_1'));
    if (!teamSnap.exists()) {
      for (const member of DEFAULT_TEAM_MEMBERS) {
        await setDoc(doc(db, 'team_members', member.id), {
          name: member.name,
          position: member.position,
          phone: member.phone,
          whatsapp: member.whatsapp,
          jobdesk: member.jobdesk
        });
      }
    }
  } catch (err) {
    console.error("Autoseeding skipped or failed (unauthorized user).", err);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');

  // PIN Verification State
  const [pinInput, setPinInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('bigate_authorized') === 'true';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const [pinError, setPinError] = useState('');

  // Table Sizing State
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('bigate_col_widths');
    return cached ? JSON.parse(cached) : {};
  });
  const [rowHeights, setRowHeights] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('bigate_row_heights');
    return cached ? JSON.parse(cached) : {};
  });

  // Database and Real-time States
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', division: '' });

  const [sheets, setSheets] = useState<any[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  const [showAddSheetModal, setShowAddSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' });

  const [accountSheets, setAccountSheets] = useState<any[]>([]);
  const [activeAccountSheetId, setActiveAccountSheetId] = useState<string>('');
  const [showAddAccountSheetModal, setShowAddAccountSheetModal] = useState(false);
  const [newAccountSheetName, setNewAccountSheetName] = useState('');
  const [showAddAccountColumnModal, setShowAddAccountColumnModal] = useState(false);
  const [newAccountColumn, setNewAccountColumn] = useState({ name: '', type: 'text' });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    position: '',
    jobdesk: '',
    whatsapp: ''
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Notifications State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // ============================================================================
  // FIREBASE REALTIME SYNC & LIFECYCLE
  // ============================================================================
  useEffect(() => {
    // 1. Listen to tutorials SOP (Publicly accessible)
    const unsubTut = onSnapshot(collection(db, 'tutorials'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTutorials(list);
      if (list.length > 0) {
        setSelectedVideo((prev: any) => {
          if (!prev) return list[0];
          const updated = list.find(v => v.id === prev.id);
          return updated || list[0];
        });
      } else {
        setSelectedVideo(null);
      }
    }, (error) => {
      console.error("Error listening to tutorials:", error);
    });

    // 2. Listen to sheets (Publicly accessible)
    const unsubSheets = onSnapshot(collection(db, 'sheets'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setSheets(list);
      if (list.length > 0) {
        setActiveSheetId((prev) => {
          if (list.find(s => s.id === prev)) return prev;
          return list[0].id;
        });
      }
    }, (error) => {
      console.error("Error listening to sheets:", error);
    });

    // 3. Listen to account sheets (Publicly accessible)
    const unsubAccSheets = onSnapshot(collection(db, 'account_sheets'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setAccountSheets(list);
      if (list.length > 0) {
        setActiveAccountSheetId((prev) => {
          if (list.find(s => s.id === prev)) return prev;
          return list[0].id;
        });
      }
    }, (error) => {
      console.error("Error listening to account sheets:", error);
    });

    // 4. Listen to team roster (Publicly accessible)
    const unsubTeam = onSnapshot(collection(db, 'team_members'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTeamMembers(list);
    }, (error) => {
      console.error("Error listening to team members:", error);
    });

    return () => {
      unsubTut();
      unsubSheets();
      unsubAccSheets();
      unsubTeam();
    };
  }, []);

  useEffect(() => {
    let unsubAdmin: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (unsubAdmin) {
        unsubAdmin();
        unsubAdmin = null;
      }
      if (u) {
        // Listen to admin status in firestore to prevent state bypass
        unsubAdmin = onSnapshot(doc(db, 'admins', u.uid), (docSnap) => {
          if (docSnap.exists() && docSnap.data().pin === '123123123') {
            setIsAuthorized(true);
            sessionStorage.setItem('bigate_authorized', 'true');
          } else {
            setIsAuthorized(false);
            sessionStorage.removeItem('bigate_authorized');
          }
        }, (error) => {
          console.error("Error listening to admin status:", error);
        });
      } else {
        setIsAuthorized(false);
        sessionStorage.removeItem('bigate_authorized');
      }
    });

    return () => {
      unsubAuth();
      if (unsubAdmin) {
        unsubAdmin();
      }
    };
  }, []);

  // Run autoseed on startup if Admin is authorized
  useEffect(() => {
    if (isAuthorized) {
      checkAndSeedDatabase();
    }
  }, [isAuthorized]);

  // Save display widths and heights locally since they are specific to each client device's screen size
  useEffect(() => {
    localStorage.setItem('bigate_col_widths', JSON.stringify(colWidths));
  }, [colWidths]);

  useEffect(() => {
    localStorage.setItem('bigate_row_heights', JSON.stringify(rowHeights));
  }, [rowHeights]);

  // ============================================================================
  // PIN SYSTEM SECURITY
  // ============================================================================
  const verifyPIN = (actionCallback: () => void) => {
    if (isAuthorized) {
      actionCallback();
    } else {
      setPinAction(() => actionCallback);
      setShowPinModal(true);
      setPinInput('');
      setPinError('');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '123123123') {
      try {
        let uid = auth.currentUser?.uid;
        if (!uid) {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          uid = result.user.uid;
        }
        if (!uid) {
          setPinError("Gagal mengidentifikasi pengguna.");
          return;
        }
        await setDoc(doc(db, 'admins', uid), {
          pin: pinInput,
          authorizedAt: Date.now()
        });
        setIsAuthorized(true);
        sessionStorage.setItem('bigate_authorized', 'true');
        setShowPinModal(false);
        setPinError('');
        showToast("Akses diizinkan!", "success");
        if (pinAction) {
          pinAction();
        }
      } catch (err) {
        console.error(err);
        setPinError("Gagal masuk dengan Google. Pastikan popup login diselesaikan.");
      }
    } else {
      setPinError("PIN Salah! Akses ditolak.");
    }
  };

  const handleResetAuthorization = async () => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'admins', auth.currentUser.uid));
      } catch (err) {
        console.error("Error removing admin doc:", err);
      }
    }
    setIsAuthorized(false);
    sessionStorage.removeItem('bigate_authorized');
    showToast("Akses berhasil dikunci.", "info");
  };

  // ============================================================================
  // COLUMN & ROW RESIZING HANDLERS
  // ============================================================================
  const handleColResizeStart = (e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colId] || 150;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const newWidth = Math.max(80, startWidth + (currentX - startX));
      setColWidths(prev => ({ ...prev, [colId]: newWidth }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleRowResizeStart = (e: React.MouseEvent, rowId: string) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = rowHeights[rowId] || 44;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentY = moveEvent.clientY;
      const newHeight = Math.max(32, startHeight + (currentY - startY));
      setRowHeights(prev => ({ ...prev, [rowId]: newHeight }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ============================================================================
  // TUTORIAL HANDLERS (BERANDA)
  // ============================================================================
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.url || !newVideo.division) {
      showToast("Harap lengkapi semua bidang video tutorial", "warning");
      return;
    }

    const processUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (url.includes('embed/')) {
          videoId = url.split('embed/')[1].split(/[?#]/)[0];
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (url.includes('drive.google.com')) {
        return url.replace(/\/view\?usp=sharing|\/view/g, '/preview');
      }
      return url;
    };

    const finalUrl = processUrl(newVideo.url);
    
    try {
      await addDoc(collection(db, 'tutorials'), {
        title: newVideo.title,
        url: finalUrl,
        division: newVideo.division
      });
      setShowAddVideoModal(false);
      setNewVideo({ title: '', url: '', division: '' });
      showToast("SOP Video tutorial berhasil ditambahkan!", "success");
    } catch (err) {
      showToast("Gagal menyimpan video. Pastikan PIN sudah diverifikasi.", "error");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    verifyPIN(async () => {
      try {
        await deleteDoc(doc(db, 'tutorials', id));
        showToast("SOP Video berhasil dihapus.", "success");
      } catch (err) {
        showToast("Gagal menghapus video. Pastikan PIN sudah diverifikasi.", "error");
      }
    });
  };

  // ============================================================================
  // SPREADSHEET POLYMORPHIC CONTEXTS
  // ============================================================================
  const getSpreadsheetContext = (tab: string) => {
    const isAccount = tab === 'account';
    return {
      sheetsList: isAccount ? accountSheets : sheets,
      setSheetsList: isAccount ? setAccountSheets : setSheets,
      collectionName: isAccount ? 'account_sheets' : 'sheets',
      activeId: isAccount ? activeAccountSheetId : activeSheetId,
      setActiveId: isAccount ? setActiveAccountSheetId : setActiveSheetId,
      showAddSheet: isAccount ? showAddAccountSheetModal : showAddSheetModal,
      setShowAddSheet: isAccount ? setShowAddAccountSheetModal : setShowAddSheetModal,
      newSheetNameInput: isAccount ? newAccountSheetName : newSheetName,
      setNewSheetNameInput: isAccount ? setNewAccountSheetName : setNewSheetName,
      showAddCol: isAccount ? showAddAccountColumnModal : showAddColumnModal,
      setShowAddCol: isAccount ? setShowAddAccountColumnModal : setShowAddColumnModal,
      newColInput: isAccount ? newAccountColumn : newColumn,
      setNewColInput: isAccount ? setNewAccountColumn : setNewColumn,
      title: isAccount ? "Database Akun Studio" : "Monitoring Spreadsheet Project"
    };
  };

  const handleAddSheetGeneric = async (e: React.FormEvent, tab: string) => {
    e.preventDefault();
    const ctx = getSpreadsheetContext(tab);
    if (!ctx.newSheetNameInput.trim()) return;

    verifyPIN(async () => {
      try {
        const colId = 'col_1';
        const newSheetObj = {
          name: ctx.newSheetNameInput,
          columns: [
            { id: colId, name: 'Kolom Utama', type: 'text' }
          ],
          rows: [
            { id: 'row_1', data: { [colId]: 'Data Entri Pertama' }, colors: {} }
          ],
          createdAt: Date.now()
        };

        const docRef = await addDoc(collection(db, ctx.collectionName), newSheetObj);
        ctx.setActiveId(docRef.id);
        ctx.setShowAddSheet(false);
        ctx.setNewSheetNameInput('');
        showToast("Sheet baru berhasil ditambahkan!", "success");
      } catch (err) {
        showToast("Gagal menambah sheet. Pastikan PIN sudah diverifikasi.", "error");
      }
    });
  };

  const handleDeleteSheetGeneric = async (tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    if (ctx.sheetsList.length <= 1) {
      showToast("Harus tersisa minimal 1 sheet aktif.", "warning");
      return;
    }

    verifyPIN(async () => {
      try {
        await deleteDoc(doc(db, ctx.collectionName, ctx.activeId));
        showToast("Sheet aktif berhasil dihapus.", "success");
      } catch (err) {
        showToast("Gagal menghapus sheet.", "error");
      }
    });
  };

  const handleAddColumnGeneric = async (e: React.FormEvent, tab: string) => {
    e.preventDefault();
    const ctx = getSpreadsheetContext(tab);
    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!ctx.newColInput.name.trim() || !activeSheet) return;

    verifyPIN(async () => {
      try {
        const colId = `col_${Date.now()}`;
        const updatedColumns = [...activeSheet.columns, { id: colId, name: ctx.newColInput.name, type: ctx.newColInput.type }];
        const updatedRows = activeSheet.rows.map((row: any) => ({
          ...row,
          data: { ...row.data, [colId]: ctx.newColInput.type === 'number' ? 0 : '' },
          colors: { ...(row.colors || {}), [colId]: 'transparent' }
        }));

        await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
          columns: updatedColumns,
          rows: updatedRows
        });

        ctx.setShowAddCol(false);
        ctx.setNewColInput({ name: '', type: 'text' });
        showToast("Kolom baru berhasil ditambahkan!", "success");
      } catch (err) {
        showToast("Gagal menambah kolom.", "error");
      }
    });
  };

  const handleDeleteColumnGeneric = async (colId: string, tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!activeSheet) return;

    if (activeSheet.columns.length <= 1) {
      showToast("Harus ada minimal 1 kolom di dalam tabel.", "warning");
      return;
    }

    verifyPIN(async () => {
      try {
        const updatedColumns = activeSheet.columns.filter((c: any) => c.id !== colId);
        const updatedRows = activeSheet.rows.map((row: any) => {
          const newData = { ...row.data };
          delete newData[colId];
          const newColors = { ...(row.colors || {}) };
          delete newColors[colId];
          return { ...row, data: newData, colors: newColors };
        });

        await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
          columns: updatedColumns,
          rows: updatedRows
        });
        showToast("Kolom berhasil dihapus.", "success");
      } catch (err) {
        showToast("Gagal menghapus kolom.", "error");
      }
    });
  };

  const handleAddRowGeneric = async (tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!activeSheet) return;

    verifyPIN(async () => {
      try {
        const rowId = `row_${Date.now()}`;
        const emptyData: Record<string, any> = {};
        const emptyColors: Record<string, string> = {};

        activeSheet.columns.forEach((col: any) => {
          emptyData[col.id] = col.type === 'number' ? 0 : '';
          emptyColors[col.id] = 'transparent';
        });

        await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
          rows: [...activeSheet.rows, { id: rowId, data: emptyData, colors: emptyColors }]
        });
        showToast("Baris entri baru ditambahkan.", "success");
      } catch (err) {
        showToast("Gagal menambah baris data.", "error");
      }
    });
  };

  const handleDeleteRowGeneric = async (rowId: string, tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!activeSheet) return;
    
    verifyPIN(async () => {
      try {
        await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
          rows: activeSheet.rows.filter((r: any) => r.id !== rowId)
        });
        showToast("Baris data dihapus.", "success");
      } catch (err) {
        showToast("Gagal menghapus baris data.", "error");
      }
    });
  };

  const handleCellEditGeneric = async (rowId: string, colId: string, value: string, type: string, tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    }

    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!activeSheet) return;

    // Update locally first for instantaneous rendering feedback
    ctx.setSheetsList(prev => prev.map(sheet => {
      if (sheet.id === ctx.activeId) {
        return {
          ...sheet,
          rows: sheet.rows.map((row: any) => {
            if (row.id === rowId) {
              return {
                ...row,
                data: { ...row.data, [colId]: parsedValue }
              };
            }
            return row;
          })
        };
      }
      return sheet;
    }));

    // Perform Firestore background write
    try {
      const updatedRows = activeSheet.rows.map((row: any) => {
        if (row.id === rowId) {
          return {
            ...row,
            data: { ...row.data, [colId]: parsedValue }
          };
        }
        return row;
      });

      await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
        rows: updatedRows
      });
    } catch (err) {
      console.error("Error editing cell:", err);
    }
  };

  const handleCellColorChangeGeneric = async (rowId: string, colId: string, color: string, tab: string) => {
    const ctx = getSpreadsheetContext(tab);
    const activeSheet = ctx.sheetsList.find(s => s.id === ctx.activeId);
    if (!activeSheet) return;

    // Local optimistic update
    ctx.setSheetsList(prev => prev.map(sheet => {
      if (sheet.id === ctx.activeId) {
        return {
          ...sheet,
          rows: sheet.rows.map((row: any) => {
            if (row.id === rowId) {
              return {
                ...row,
                colors: {
                  ...(row.colors || {}),
                  [colId]: color
                }
              };
            }
            return row;
          })
        };
      }
      return sheet;
    }));

    try {
      const updatedRows = activeSheet.rows.map((row: any) => {
        if (row.id === rowId) {
          return {
            ...row,
            colors: {
              ...(row.colors || {}),
              [colId]: color
            }
          };
        }
        return row;
      });

      await updateDoc(doc(db, ctx.collectionName, ctx.activeId), {
        rows: updatedRows
      });
    } catch (err) {
      console.error("Error updating cell color in Firestore:", err);
    }
  };

  // ============================================================================
  // TEAM ROSTER HANDLERS
  // ============================================================================
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, position, jobdesk, whatsapp } = newMember;
    if (!name || !phone || !position || !jobdesk || !whatsapp) {
      showToast("Harap isi seluruh isian profil tim!", "warning");
      return;
    }

    try {
      await addDoc(collection(db, 'team_members'), {
        name,
        phone,
        position,
        jobdesk,
        whatsapp
      });
      setNewMember({ name: '', phone: '', position: '', jobdesk: '', whatsapp: '' });
      setShowAddMemberModal(false);
      showToast("Profil anggota tim berhasil disimpan!", "success");
    } catch (err) {
      showToast("Gagal menyimpan profil tim. Pastikan PIN sudah diverifikasi.", "error");
    }
  };

  const handleDeleteMember = async (id: string) => {
    verifyPIN(async () => {
      try {
        await deleteDoc(doc(db, 'team_members', id));
        showToast("Profil tim berhasil dihapus.", "success");
      } catch (err) {
        showToast("Gagal menghapus profil tim. Pastikan PIN sudah diverifikasi.", "error");
      }
    });
  };

  const getWaLink = (num: string) => {
    let cleanNum = num.replace(/[^0-9]/g, '');
    if (cleanNum.startsWith('0')) {
      cleanNum = '62' + cleanNum.slice(1);
    }
    return `https://wa.me/${cleanNum}`;
  };

  // Sidebar Tabs configuration
  const navItems = [
    { id: 'beranda', label: 'Beranda SOP', icon: Home },
    { id: 'absensi', label: 'Absensi', icon: Clock },
    { id: 'project', label: 'Spreadsheet Project', icon: Layers },
    { id: 'upload', label: 'Upload Aset', icon: UploadCloud },
    { id: 'tentang-kami', label: 'Roster Tim', icon: Users },
    { id: 'account', label: 'Database Akun', icon: Lock },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'account') {
      verifyPIN(() => setActiveTab('account'));
    } else {
      setActiveTab(id);
    }
  };

  const activeCtx = getSpreadsheetContext(activeTab);
  const activeSheetObj = activeCtx.sheetsList.find(s => s.id === activeCtx.activeId);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-cyan-500 selection:text-slate-900 relative">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      {/* ============================================================================
          SIDEBAR KIRI (GLOSSY & RESPONSIVE)
          ============================================================================ */}
      <aside className="w-20 lg:w-64 shrink-0 h-full border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-md flex flex-col z-40 transition-all duration-300 relative shadow-2xl">
        
        {/* Branding header */}
        <div className="h-24 flex flex-col lg:flex-row items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/60 shrink-0 gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 shrink-0">
            <span className="text-white font-display font-bold text-lg tracking-wider">BC</span>
            <div className="absolute inset-0 rounded-xl border border-white/20" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 text-sm lg:text-base truncate">
              Bigate Creative
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate font-mono">
              Management Hub
            </p>
          </div>
        </div>

        {/* Navigation panel */}
        <nav className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isAccount = item.id === 'account';
            const isActive = activeTab === item.id;
            
            let btnClass = "";
            if (isAccount) {
              btnClass = isActive
                ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-md shadow-yellow-500/5'
                : 'text-amber-400/80 hover:text-yellow-200 hover:bg-yellow-950/20 border border-transparent';
            } else {
              btnClass = isActive
                ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent';
            }

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`group w-full flex items-center justify-center lg:justify-start gap-3.5 p-3 lg:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${btnClass}`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* ============================================================================
          MAIN VIEW CONTAINER
          ============================================================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* TOAST PANEL */}
        <AnimatePresence>
          {toast.show && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-6 right-6 z-50 pointer-events-none"
            >
              <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 pointer-events-auto ${
                toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300' :
                toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/60 text-rose-300' :
                toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/60 text-amber-300' :
                'bg-slate-900/90 border-slate-700/60 text-slate-300'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                <span className="font-semibold text-xs sm:text-sm">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE CANVAS CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            
            {/* ============================================================================
                TAB: BERANDA SOP & TUTORIAL
                ============================================================================ */}
            {activeTab === 'beranda' && (
              <div className="space-y-6 animate-fade-in">
                {/* Welcoming Dashboard Card */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-950/60 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                      <Play className="w-3 h-3 fill-current" /> Pusat Dokumentasi SOP
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white leading-tight">
                      SOP & Tutorial Divisi Studio
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Pusat dokumentasi video tutorial alur kerja Bigate Creative. Silakan tambah materi pengerjaan, pedoman software, atau panduan pengiriman aset divisi Anda.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      id="add-sop-btn"
                      onClick={() => verifyPIN(() => setShowAddVideoModal(true))}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Tambah SOP Video</span>
                    </button>
                  </div>
                </div>

                {/* Main player workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Player Screen */}
                  <div className="lg:col-span-2 space-y-4">
                    {selectedVideo ? (
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-3 backdrop-blur-sm">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-900">
                          <iframe
                            src={selectedVideo.url}
                            title={selectedVideo.title}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                        
                        <div className="mt-4 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400 mb-1">
                              Divisi: {selectedVideo.division}
                            </span>
                            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">{selectedVideo.title}</h3>
                          </div>
                          
                            <button 
                              onClick={() => handleDeleteVideo(selectedVideo.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/40 text-xs font-semibold transition-all self-start sm:self-center shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Hapus SOP</span>
                            </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-slate-500 gap-3 bg-slate-900/10">
                        <Play className="w-12 h-12 stroke-[1] text-slate-600 animate-pulse" />
                        <p className="text-xs sm:text-sm font-medium">Belum ada video tutorial aktif yang terdaftar</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Video Playlist */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-4 flex flex-col h-[400px] lg:h-auto max-h-[500px]">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-3 shrink-0">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300">
                        Daftar Putar SOP
                      </h4>
                      <span className="text-[10px] font-mono font-semibold bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-full text-cyan-400">
                        {tutorials.length} Video
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {tutorials.map((vid) => {
                        const thumb = getThumbnailUrl(vid.url);
                        const isSelected = selectedVideo?.id === vid.id;
                        
                        return (
                          <div
                            key={vid.id}
                            onClick={() => setSelectedVideo(vid)}
                            className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-gradient-to-r from-slate-900 to-slate-850 border-cyan-500/50 text-white'
                                : 'bg-slate-950/40 hover:bg-slate-900/40 border-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="shrink-0 w-16 h-10 rounded-md overflow-hidden bg-slate-900 flex items-center justify-center relative shadow-inner">
                              {thumb ? (
                                <img 
                                  src={thumb} 
                                  alt="Thumbnail" 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                                />
                              ) : (
                                <Play className="w-4 h-4 text-slate-600" />
                              )}
                              <div className={`absolute inset-0 border border-white/5 rounded-md ${isSelected ? 'bg-cyan-500/10' : ''}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 block mb-0.5">
                                {vid.division}
                              </span>
                              <h5 className="font-semibold text-[11px] sm:text-xs line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                {vid.title}
                              </h5>
                            </div>
                          </div>
                        );
                      })}

                      {tutorials.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                          <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                          <p className="text-xs">Daftar putar kosong. Silakan tambahkan file SOP di atas.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ============================================================================
                TAB: ABSENSI KONTROL
                ============================================================================ */}
            {activeTab === 'absensi' && (
              <div className="max-w-xl mx-auto py-12 text-center space-y-8 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-2 shadow-inner">
                  <Clock className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">Absensi Harian Tim</h2>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                    Akses formulir pelaporan jam kehadiran masuk dan pulang harian untuk pelacakan performa, log harian, dan verifikasi kehadiran tim studio.
                  </p>
                </div>

                <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/10">
                  <a 
                    href="https://share.gemini.google/eUvOPrPjSl9H"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-slate-950 hover:bg-slate-900/80 text-white font-bold rounded-[14px] transition-all duration-300 group"
                  >
                    <span className="tracking-wide text-xs sm:text-sm">Lapor Absensi Sekarang</span>
                    <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  *Tautan mengarah ke portal pencatatan internal tim Bigate.
                </div>
              </div>
            )}

            {/* ============================================================================
                TAB: SPREADSHEETS (PROJECTS / ACCOUNTS)
                ============================================================================ */}
            {(activeTab === 'project' || activeTab === 'account') && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Control Action Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                      {activeCtx.title}
                    </h3>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="add-sheet-btn"
                      onClick={() => verifyPIN(() => activeCtx.setShowAddSheet(true))}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Sheet</span>
                    </button>
                    
                    <button
                      id="add-column-btn"
                      onClick={() => verifyPIN(() => activeCtx.setShowAddCol(true))}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Kolom</span>
                    </button>

                    <button
                      id="add-row-btn"
                      onClick={() => verifyPIN(() => handleAddRowGeneric(activeTab))}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tambah Baris</span>
                    </button>

                    <button
                      id="delete-sheet-btn"
                      onClick={() => handleDeleteSheetGeneric(activeTab)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/20 hover:bg-rose-950/55 text-rose-400 text-xs font-semibold rounded-lg border border-rose-900/30 transition-all"
                      title="Hapus Sheet Aktif"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus Sheet</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal Sheets tabs */}
                <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-px scrollbar-none">
                  {activeCtx.sheetsList.map(sheet => (
                    <button
                      key={sheet.id}
                      onClick={() => activeCtx.setActiveId(sheet.id)}
                      className={`px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide border-t-2 border-x transition-all duration-200 whitespace-nowrap rounded-t-xl ${
                        activeCtx.activeId === sheet.id
                          ? 'bg-slate-950 border-x-slate-800 border-t-cyan-500 text-cyan-400'
                          : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>

                {/* Spreadsheet Body */}
                {activeSheetObj ? (
                  <div className="border border-slate-800/80 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="text-left border-collapse table-fixed min-w-[750px] w-full">
                        <colgroup>
                          <col style={{ width: 64 }} />
                          {activeSheetObj.columns.map((col: any) => (
                            <col key={col.id} style={{ width: colWidths[col.id] || 160 }} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-900/40 border-b border-slate-800">
                            <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center border-r border-slate-800/80 relative select-none">
                              Aksi
                            </th>
                            {activeSheetObj.columns.map((col: any) => (
                              <th 
                                key={col.id} 
                                className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800/80 relative group select-none"
                              >
                                <div className="flex items-center justify-between pr-4">
                                  <span className="truncate text-slate-300" title={col.name}>{col.name}</span>
                                  <span className="text-[8px] lowercase font-mono font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 shrink-0">
                                    {col.type}
                                  </span>
                                </div>
                                
                                {/* Resize column handle */}
                                <div 
                                  onMouseDown={(e) => handleColResizeStart(e, col.id)}
                                  className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-cyan-500/60 active:bg-cyan-500 z-10" 
                                />

                                {/* Hover column delete button */}
                                <button
                                  onClick={() => handleDeleteColumnGeneric(col.id, activeTab)}
                                  className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-rose-950/95 text-rose-400 border border-rose-800/40 rounded hover:bg-rose-900 transition-all z-20"
                                  title="Hapus Kolom"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {activeSheetObj.rows.map((row: any) => (
                            <tr 
                              key={row.id} 
                              style={{ height: rowHeights[row.id] || 44 }}
                              className="hover:bg-slate-900/10 transition-colors"
                            >
                              <td className="p-2 text-center border-r border-slate-800/80 relative">
                                <div className="flex items-center justify-center h-full">
                                    <button
                                      onClick={() => handleDeleteRowGeneric(row.id, activeTab)}
                                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                                      title="Hapus Baris"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Row height resize handle */}
                                <div 
                                  onMouseDown={(e) => handleRowResizeStart(e, row.id)}
                                  className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-cyan-500/60 active:bg-cyan-500 z-10" 
                                />
                              </td>
                              
                              {activeSheetObj.columns.map((col: any) => {
                                const val = row.data[col.id] !== undefined ? row.data[col.id] : '';
                                const cellColor = row.colors?.[col.id] && row.colors[col.id] !== 'transparent' ? row.colors[col.id] : '';
                                const textColor = getContrastColor(cellColor);

                                return (
                                  <td 
                                    key={col.id} 
                                    className="p-0 border-r border-slate-800/80 relative group/cell transition-colors" 
                                    style={{ backgroundColor: cellColor }}
                                  >
                                    <div className="w-full h-full flex items-center relative">
                                      <input
                                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                        value={val}
                                        readOnly={!isAuthorized}
                                        onClick={!isAuthorized ? () => verifyPIN(() => {}) : undefined}
                                        onChange={(e) => handleCellEditGeneric(row.id, col.id, e.target.value, col.type, activeTab)}
                                        className={`w-full h-full bg-transparent hover:bg-white/5 focus:bg-white/10 border-0 px-3 text-xs sm:text-sm focus:outline-none transition-all ${!cellColor ? 'text-slate-300' : ''}`}
                                        style={{ color: textColor || undefined }}
                                        placeholder="..."
                                      />
                                      
                                      {/* Cell color picker menu */}
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 w-5 h-5 rounded cursor-pointer overflow-hidden border border-slate-700/60 shadow-md z-10" title="Ubah warna latar">
                                        <input
                                          type="color"
                                          value={cellColor || '#020617'}
                                          onClick={!isAuthorized ? (e) => { e.preventDefault(); verifyPIN(() => {}); } : undefined}
                                          onChange={(e) => handleCellColorChangeGeneric(row.id, col.id, e.target.value, activeTab)}
                                          className="absolute -top-2.5 -left-2.5 w-10 h-10 cursor-pointer p-0 border-0 bg-transparent"
                                        />
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                          {activeSheetObj.rows.length === 0 && (
                            <tr>
                              <td colSpan={activeSheetObj.columns.length + 1} className="p-8 text-center text-slate-500 text-xs">
                                Tabel kosong. Klik "Tambah Baris" di atas untuk menambahkan baris data pertama.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    Memuat tabel sheet...
                  </div>
                )}

              </div>
            )}

            {/* ============================================================================
                TAB: UPLOAD ARCHIVES
                ============================================================================ */}
            {activeTab === 'upload' && (
              <div className="max-w-xl mx-auto py-12 text-center space-y-8 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-2 shadow-inner">
                  <UploadCloud className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">Upload File Studio</h2>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                    Kirimkan draf desain, aset model 3D render, aset video mentah, atau dokumen kesepakatan klien langsung ke dalam cloud folder penyimpanan resmi tim Bigate.
                  </p>
                </div>

                <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/10">
                  <a 
                    href="https://drive.google.com/drive/folders/1t1NPTH9fhTNRpGxhh6HBo31ki_xCvtm?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-slate-950 hover:bg-slate-900/80 text-white font-bold rounded-[14px] transition-all duration-300 group"
                  >
                    <span className="tracking-wide text-xs sm:text-sm">Buka Cloud Folder Upload</span>
                    <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            )}

            {/* ============================================================================
                TAB: ROSTER TIM (TENTANG KAMI)
                ============================================================================ */}
            {activeTab === 'tentang-kami' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Team Info Panel */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center justify-center sm:justify-start gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span>Roster Pilar Tim Kreatif</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Roster resmi, jabatan, serta alur kontak tim pilar studio kreatif Bigate.
                    </p>
                  </div>

                  <button
                    id="add-team-member-btn"
                    onClick={() => verifyPIN(() => setShowAddMemberModal(true))}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Input Profil Tim</span>
                  </button>
                </div>

                {/* Team profiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="relative group rounded-2xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-sm p-5 flex flex-col gap-4 overflow-hidden shadow-lg transition-all hover:border-slate-700 hover:-translate-y-0.5 duration-200"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600" />

                      {/* Header block info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 border border-slate-700 shadow-inner">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white truncate max-w-[170px]">{member.name}</h4>
                          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{member.position}</p>
                        </div>
                      </div>

                      {/* Jobdesk details */}
                      <div className="space-y-1 flex-1 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Jobdesk Kerja</span>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3" title={member.jobdesk}>{member.jobdesk}</p>
                      </div>

                      {/* Contact metadata */}
                      <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center justify-between">
                          <span>Handphone:</span>
                          <span className="text-slate-200">{member.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>WhatsApp:</span>
                          <span className="text-slate-200">{member.whatsapp}</span>
                        </div>
                      </div>

                      {/* WA messaging redirect anchor */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                        <a
                          href={getWaLink(member.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-cyan-900 group"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>Hubungi WA</span>
                        </a>

                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all border border-transparent hover:border-rose-950"
                            title="Hapus Profil Tim"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    </div>
                  ))}

                  {teamMembers.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 rounded-2xl border border-dashed border-slate-850 flex flex-col items-center justify-center gap-3 bg-slate-900/10">
                      <Users className="w-10 h-10 stroke-[1] text-slate-600 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-400">Belum ada profil tim terdaftar</p>
                        <p className="text-[11px] text-slate-500">Klik "Input Profil Tim" di atas untuk menambahkan.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team profiles analytical roster table */}
                {teamMembers.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-1">
                      Ikhtisar Matriks Roster Tim
                    </h4>
                    <div className="border border-slate-800/80 rounded-xl bg-slate-950 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                          <colgroup>
                            <col style={{ width: 160 }} />
                            <col style={{ width: 160 }} />
                            <col style={{ width: 300 }} />
                            <col style={{ width: 140 }} />
                            <col style={{ width: 120 }} />
                          </colgroup>
                          <thead className="bg-slate-900/40 border-b border-slate-850 text-slate-400 text-[9px] uppercase font-bold tracking-wider select-none">
                            <tr>
                              <th className="p-3.5">Nama Pilar</th>
                              <th className="p-3.5">Jabatan</th>
                              <th className="p-3.5">Deskripsi Tugas</th>
                              <th className="p-3.5">No. Handphone</th>
                              <th className="p-3.5 text-center">Hubungi Kontak</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 text-slate-300">
                            {teamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-slate-900/10 transition-colors">
                                <td className="p-3.5 font-semibold text-white">{member.name}</td>
                                <td className="p-3.5 text-cyan-400 font-medium text-xs">{member.position}</td>
                                <td className="p-3.5 max-w-xs truncate text-xs" title={member.jobdesk}>{member.jobdesk}</td>
                                <td className="p-3.5 font-mono text-xs">{member.phone}</td>
                                <td className="p-3.5 text-center">
                                  <a
                                    href={getWaLink(member.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-900/50 hover:border-cyan-800 rounded-md transition-colors text-xs font-bold"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* FOOTER METADATA */}
          <footer className="w-full mt-16 py-6 border-t border-slate-900/80 text-center text-[11px] text-slate-500 font-mono">
            <p>© 2026 Bigate Creative Studio. Semua Perubahan Disinkronkan Otomatis.</p>
          </footer>

        </main>
      </div>

      {/* ============================================================================
          POPUP MODALS (GLASSMORPHISM STYLE)
          ============================================================================ */}
      
      {/* 1. SECURE PIN VALIDATOR MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-bold text-white">Konfirmasi PIN Kredensial</h3>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Masukkan PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 text-center font-mono tracking-widest text-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-center text-xs text-rose-400 font-semibold mt-2">{pinError}</p>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false);
                      setPinInput('');
                      setPinError('');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/10"
                  >
                    Verifikasi PIN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. ADD VIDEO MODAL */}
      <AnimatePresence>
        {showAddVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-base font-display font-bold text-white">Tambah Video SOP Tutorial</h3>
                <button 
                  onClick={() => setShowAddVideoModal(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Judul SOP / Tutorial</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cara Render Maksimal Blender Cycles"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Link Video (YouTube / Google Drive)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 italic block">
                    Mendukung format tautan YouTube standar atau tautan bagikan Google Drive.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Divisi Pengerjaan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3D Animasi, Video Editor, dll"
                    value={newVideo.division}
                    onChange={(e) => setNewVideo({ ...newVideo, division: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVideoModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/10"
                  >
                    Simpan SOP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ADD SHEET MODAL */}
      <AnimatePresence>
        {(showAddSheetModal || showAddAccountSheetModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-base font-display font-bold text-white">Buat Sheet Baru</h3>
                <button onClick={() => { setShowAddSheetModal(false); setShowAddAccountSheetModal(false); }} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={(e) => handleAddSheetGeneric(e, activeTab)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Nama Sheet Baru</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Projek Juli 2026 / Akun Sosmed"
                    value={activeCtx.newSheetNameInput}
                    onChange={(e) => activeCtx.setNewSheetNameInput(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddSheetModal(false); setShowAddAccountSheetModal(false); }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition-colors"
                  >
                    Buat Sheet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. ADD COLUMN MODAL */}
      <AnimatePresence>
        {(showAddColumnModal || showAddAccountColumnModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-base font-display font-bold text-white">Tambah Kolom Baru</h3>
                <button onClick={() => { setShowAddColumnModal(false); setShowAddAccountColumnModal(false); }} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={(e) => handleAddColumnGeneric(e, activeTab)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Nama Kolom</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Penanggung Jawab"
                    value={activeCtx.newColInput.name}
                    onChange={(e) => activeCtx.setNewColInput({ ...activeCtx.newColInput, name: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Tipe Data Kolom</label>
                  <select
                    value={activeCtx.newColInput.type}
                    onChange={(e) => activeCtx.setNewColInput({ ...activeCtx.newColInput, type: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="text">Teks Bebas</option>
                    <option value="number">Angka (Budget / Rupiah)</option>
                    <option value="date">Tanggal (Deadline)</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddColumnModal(false); setShowAddAccountColumnModal(false); }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition-colors"
                  >
                    Buat Kolom
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ADD TEAM MEMBER MODAL */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-base font-display font-bold text-white">Input Anggota Tim Baru</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleAddTeamMember} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Reyhan Bigate"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Posisi / Jabatan</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Lead 3D Animator"
                      value={newMember.position}
                      onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                      className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">No HP Kontak</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold">No. WhatsApp</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890 (Digunakan untuk link chat langsung)"
                      value={newMember.whatsapp}
                      onChange={(e) => setNewMember({ ...newMember, whatsapp: e.target.value })}
                      className="w-full h-10 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold">Deskripsi Tugas / Jobdesk</label>
                  <textarea
                    required
                    placeholder="Mengatur timeline project 3D studio, QC asset rendering, supervisi blender..."
                    value={newMember.jobdesk}
                    onChange={(e) => setNewMember({ ...newMember, jobdesk: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/10"
                  >
                    Simpan Profil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
