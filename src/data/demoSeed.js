import {
  RECOVERY_STATUS,
  REPORT_STATUS,
} from '../config/constants.js';
import { DEFAULT_MATCHING_CONFIG } from '../config/matchingConfig.js';

function svgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const ITEM_ARTWORKS = {
  earbuds: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <rect x="52" y="46" width="96" height="108" rx="34" fill="#FFFFFF" stroke="#D5DDF5" stroke-width="4"/>
      <line x1="54" y1="88" x2="146" y2="88" stroke="#CBD5F0" stroke-width="3"/>
      <rect x="86" y="96" width="28" height="6" rx="3" fill="#DDE2FF"/>
      <circle cx="100" cy="126" r="5" fill="#303BFA"/>
    </svg>
  `),
  wallet: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <rect x="38" y="62" width="124" height="80" rx="16" fill="#1E2547"/>
      <path d="M48 62 L144 48 L150 62 Z" fill="#323C6B"/>
      <rect x="114" y="88" width="52" height="28" rx="10" fill="#2E3866"/>
      <circle cx="130" cy="102" r="5" fill="#DDE2FF"/>
    </svg>
  `),
  bottle: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <rect x="82" y="34" width="36" height="18" rx="6" fill="#11183B"/>
      <rect x="88" y="50" width="24" height="10" fill="#C7D2FE"/>
      <rect x="70" y="58" width="60" height="106" rx="16" fill="#303BFA"/>
      <rect x="76" y="76" width="10" height="72" rx="5" fill="#636BFF" opacity="0.5"/>
    </svg>
  `),
  calculator: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <rect x="56" y="34" width="88" height="132" rx="14" fill="#222B4F"/>
      <rect x="68" y="48" width="64" height="30" rx="6" fill="#DDE2FF"/>
      <g fill="#586599">
        <rect x="68" y="92" width="14" height="12" rx="3"/>
        <rect x="88" y="92" width="14" height="12" rx="3"/>
        <rect x="108" y="92" width="14" height="12" rx="3"/>
        <rect x="68" y="112" width="14" height="12" rx="3"/>
        <rect x="88" y="112" width="14" height="12" rx="3"/>
        <rect x="108" y="112" width="14" height="12" rx="3"/>
        <rect x="68" y="132" width="14" height="12" rx="3"/>
        <rect x="88" y="132" width="14" height="12" rx="3"/>
        <rect x="108" y="132" width="14" height="20" rx="3" fill="#303BFA"/>
      </g>
    </svg>
  `),
  idcard: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <path d="M92 26 L100 54 L108 26" stroke="#303BFA" stroke-width="6" fill="none"/>
      <rect x="40" y="54" width="120" height="92" rx="14" fill="#FFFFFF" stroke="#CBD5F0" stroke-width="3"/>
      <rect x="40" y="54" width="120" height="22" rx="8" fill="#303BFA"/>
      <circle cx="72" cy="108" r="16" fill="#DDE2FF"/>
      <rect x="98" y="96" width="46" height="8" rx="4" fill="#11183B" opacity="0.75"/>
      <rect x="98" y="112" width="34" height="8" rx="4" fill="#CBD5F0"/>
    </svg>
  `),
  bag: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <path d="M78 58 C78 38, 122 38, 122 58" stroke="#11183B" stroke-width="8" fill="none" stroke-linecap="round"/>
      <rect x="52" y="56" width="96" height="106" rx="24" fill="#1F2A56"/>
      <rect x="66" y="102" width="68" height="44" rx="12" fill="#303BFA"/>
    </svg>
  `),
  book: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <rect x="52" y="42" width="96" height="116" rx="10" fill="#303BFA"/>
      <rect x="52" y="42" width="18" height="116" rx="4" fill="#11183B"/>
      <rect x="84" y="64" width="48" height="14" rx="4" fill="#FFFFFF"/>
      <rect x="84" y="88" width="36" height="8" rx="4" fill="#DDE2FF"/>
    </svg>
  `),
  keys: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="#EEF1FA"/>
      <circle cx="84" cy="82" r="24" fill="none" stroke="#11183B" stroke-width="10"/>
      <rect x="98" y="96" width="54" height="12" rx="6" transform="rotate(35 98 96)" fill="#303BFA"/>
    </svg>
  `),
};

function daysAgoIso(days, hourOffset = 0) {
  const dt = new Date(Date.now() - days * 86400000 - hourOffset * 3600000);
  return dt.toISOString();
}

function dateStrDaysAgo(days) {
  const dt = new Date(Date.now() - days * 86400000);
  return dt.toISOString().split('T')[0];
}

export function createInitialDemoState() {
  const users = [
    {
      uid: 'student_aryan',
      name: 'Aryan Sharma',
      email: 'aryan@campus.edu',
      role: 'student',
      studentId: 'CS2024-118',
      department: 'Computer Science',
      phone: '+91 98765 43210',
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: daysAgoIso(30),
    },
    {
      uid: 'student_kunal',
      name: 'Kunal Verma',
      email: 'kunal@campus.edu',
      role: 'student',
      studentId: 'EC2024-042',
      department: 'Electronics & Comm.',
      phone: '+91 98765 11223',
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: daysAgoIso(28),
    },
    {
      uid: 'student_neha',
      name: 'Neha Nair',
      email: 'neha@campus.edu',
      role: 'student',
      studentId: 'ME2023-087',
      department: 'Mechanical Eng.',
      phone: '+91 98111 22445',
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: daysAgoIso(25),
    },
    {
      uid: 'student_rohan',
      name: 'Rohan Das',
      email: 'rohan@campus.edu',
      role: 'student',
      studentId: 'IT2025-019',
      department: 'Information Tech.',
      phone: '+91 98222 33445',
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: daysAgoIso(20),
    },
    {
      uid: 'admin_security',
      name: 'Security Admin',
      email: 'security@campus.edu',
      role: 'admin',
      studentId: 'SEC-001',
      department: 'Campus Security Office',
      phone: 'Ext. 4100',
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: daysAgoIso(90),
    },
  ];

  const reports = [
    {
      id: 'rep_lost_1',
      type: 'lost',
      itemName: 'White Wireless Earbuds',
      category: 'Electronics',
      description: 'Apple AirPods Pro white charging case with a faint blue silicone scuff on the lid, dropped near study desks.',
      colour: 'White',
      location: 'Library',
      date: dateStrDaysAgo(1),
      time: '15:30',
      photoUrl: ITEM_ARTWORKS.earbuds,
      reporterId: 'student_aryan',
      reporterName: 'Aryan Sharma',
      status: REPORT_STATUS.MATCH_FOUND,
      heldBySecurity: false,
      createdAt: daysAgoIso(1, 3),
      updatedAt: daysAgoIso(0, 5),
    },
    {
      id: 'rep_found_1',
      type: 'found',
      itemName: 'White Earbuds Case',
      category: 'Electronics',
      description: 'Found white wireless earbuds charging case on the 2nd floor reading table at the campus library.',
      colour: 'White',
      location: 'Library',
      date: dateStrDaysAgo(1),
      time: '16:10',
      photoUrl: ITEM_ARTWORKS.earbuds,
      reporterId: 'student_kunal',
      reporterName: 'Kunal Verma',
      status: REPORT_STATUS.IN_REVIEW,
      heldBySecurity: false,
      createdAt: daysAgoIso(0, 2),
      updatedAt: daysAgoIso(0, 2),
    },
    {
      id: 'rep_lost_2',
      type: 'lost',
      itemName: 'Black Leather Wallet',
      category: 'Wallets',
      description: 'Slim black bi-fold leather wallet with metro card and college cafeteria pass inside.',
      colour: 'Black',
      location: 'Canteen',
      date: dateStrDaysAgo(2),
      time: '13:15',
      photoUrl: ITEM_ARTWORKS.wallet,
      reporterId: 'student_neha',
      reporterName: 'Neha Nair',
      status: REPORT_STATUS.MATCH_FOUND,
      heldBySecurity: false,
      createdAt: daysAgoIso(2, 5),
      updatedAt: daysAgoIso(1, 2),
    },
    {
      id: 'rep_found_2',
      type: 'found',
      itemName: 'Black Bi-fold Wallet',
      category: 'Wallets',
      description: 'Black leather wallet found near Canteen counter 2. Handed over for safe custody.',
      colour: 'Black',
      location: 'Canteen',
      date: dateStrDaysAgo(2),
      time: '13:45',
      photoUrl: ITEM_ARTWORKS.wallet,
      reporterId: 'student_rohan',
      reporterName: 'Rohan Das',
      status: REPORT_STATUS.HELD_BY_SECURITY,
      heldBySecurity: true,
      securityShelfCode: 'SEC-A14',
      createdAt: daysAgoIso(2, 4),
      updatedAt: daysAgoIso(1, 1),
    },
    {
      id: 'rep_found_3',
      type: 'found',
      itemName: 'Blue Insulated Bottle',
      category: 'Bottles',
      description: 'Matte royal blue stainless steel water bottle with sports cap left beside the Main Building bench.',
      colour: 'Blue',
      location: 'Main Building',
      date: dateStrDaysAgo(1),
      time: '11:20',
      photoUrl: ITEM_ARTWORKS.bottle,
      reporterId: 'student_aryan',
      reporterName: 'Aryan Sharma',
      status: REPORT_STATUS.AVAILABLE,
      heldBySecurity: false,
      createdAt: daysAgoIso(1),
      updatedAt: daysAgoIso(1),
    },
    {
      id: 'rep_lost_3',
      type: 'lost',
      itemName: 'Casio Scientific Calculator',
      category: 'Electronics',
      description: 'Black Casio fx-991EX ClassWiz scientific calculator with silver border lost after lab quiz.',
      colour: 'Black',
      location: 'Computer Lab',
      date: dateStrDaysAgo(3),
      time: '10:30',
      photoUrl: ITEM_ARTWORKS.calculator,
      reporterId: 'student_aryan',
      reporterName: 'Aryan Sharma',
      status: REPORT_STATUS.ACTIVE,
      heldBySecurity: false,
      createdAt: daysAgoIso(3),
      updatedAt: daysAgoIso(3),
    },
    {
      id: 'rep_found_4',
      type: 'found',
      itemName: 'Casio fx-991EX Calculator',
      category: 'Electronics',
      description: 'Found a black scientific calculator on desk row 4 in the Computer Lab.',
      colour: 'Black',
      location: 'Computer Lab',
      date: dateStrDaysAgo(3),
      time: '11:45',
      photoUrl: ITEM_ARTWORKS.calculator,
      reporterId: 'student_rohan',
      reporterName: 'Rohan Das',
      status: REPORT_STATUS.AVAILABLE,
      heldBySecurity: false,
      createdAt: daysAgoIso(3),
      updatedAt: daysAgoIso(3),
    },
    {
      id: 'rep_found_5',
      type: 'found',
      itemName: 'Student Campus ID Card',
      category: 'Documents / ID Cards',
      description: 'Campus student ID card on blue lanyard found outside Auditorium entrance.',
      colour: 'Blue',
      location: 'Auditorium',
      date: dateStrDaysAgo(1),
      time: '17:00',
      photoUrl: ITEM_ARTWORKS.idcard,
      reporterId: 'student_kunal',
      reporterName: 'Kunal Verma',
      status: REPORT_STATUS.HELD_BY_SECURITY,
      heldBySecurity: true,
      securityShelfCode: 'SEC-ID08',
      createdAt: daysAgoIso(1),
      updatedAt: daysAgoIso(1),
    },
    {
      id: 'rep_lost_4',
      type: 'lost',
      itemName: 'Data Structures Textbook',
      category: 'Books',
      description: 'Blue hardcover algorithms & data structures book with sticky tabs inside.',
      colour: 'Blue',
      location: 'Library',
      date: dateStrDaysAgo(5),
      time: '14:00',
      photoUrl: ITEM_ARTWORKS.book,
      reporterId: 'student_aryan',
      reporterName: 'Aryan Sharma',
      status: REPORT_STATUS.RETURNED,
      heldBySecurity: false,
      createdAt: daysAgoIso(5),
      updatedAt: daysAgoIso(2),
    },
    {
      id: 'rep_found_6',
      type: 'found',
      itemName: 'Algorithms Hardcover Book',
      category: 'Books',
      description: 'Blue hardcover textbook with yellow sticky notes found on Library shelf desk.',
      colour: 'Blue',
      location: 'Library',
      date: dateStrDaysAgo(5),
      time: '15:00',
      photoUrl: ITEM_ARTWORKS.book,
      reporterId: 'student_neha',
      reporterName: 'Neha Nair',
      status: REPORT_STATUS.RETURNED,
      heldBySecurity: false,
      createdAt: daysAgoIso(5),
      updatedAt: daysAgoIso(2),
    },
    {
      id: 'rep_lost_5',
      type: 'lost',
      itemName: 'Navy Laptop Backpack',
      category: 'Bags',
      description: 'Dark navy padded laptop bag with two front zippers and keychain loop.',
      colour: 'Blue',
      location: 'Sports Ground',
      date: dateStrDaysAgo(4),
      time: '18:00',
      photoUrl: ITEM_ARTWORKS.bag,
      reporterId: 'student_kunal',
      reporterName: 'Kunal Verma',
      status: REPORT_STATUS.ACTIVE,
      heldBySecurity: false,
      createdAt: daysAgoIso(4),
      updatedAt: daysAgoIso(4),
    },
    {
      id: 'rep_found_7',
      type: 'found',
      itemName: 'Hostel Room Key & Tag',
      category: 'Keys',
      description: 'Silver key with blue rubber tag found near Parking Area cycle stand.',
      colour: 'Silver',
      location: 'Parking Area',
      date: dateStrDaysAgo(0),
      time: '09:15',
      photoUrl: ITEM_ARTWORKS.keys,
      reporterId: 'student_aryan',
      reporterName: 'Aryan Sharma',
      status: REPORT_STATUS.AVAILABLE,
      heldBySecurity: false,
      createdAt: daysAgoIso(0, 4),
      updatedAt: daysAgoIso(0, 4),
    },
  ];

  // Private identifying details separated cleanly from public reports
  const reportSecrets = {
    rep_lost_1: {
      reporterId: 'student_aryan',
      privateDetails: 'Serial ends in H9K2; left earbud has tiny scratch near mic grill; Bluetooth device name is "Aryan Pods".',
    },
    rep_found_1: {
      reporterId: 'student_kunal',
      privateDetails: 'Case opens to show engraved initials A.S. inside the lid; right earbud battery at 80%.',
    },
    rep_lost_2: {
      reporterId: 'student_neha',
      privateDetails: 'Contains Metro card ending 4491 and a folded passport photo inside secret flap.',
    },
    rep_found_2: {
      reporterId: 'student_rohan',
      privateDetails: 'Has a small passport photo and Metro card ending 4491 inside.',
    },
    rep_lost_3: {
      reporterId: 'student_aryan',
      privateDetails: 'Back battery cover has "AS-118" written in black permanent marker.',
    },
    rep_found_4: {
      reporterId: 'student_rohan',
      privateDetails: 'Marked "AS-118" on rear sliding cover.',
    },
    rep_found_5: {
      reporterId: 'student_kunal',
      privateDetails: 'Student ID card belonging to Meera Pillai, Roll ME24-051.',
    },
  };

  const matches = [
    {
      id: 'match_1',
      matchKey: 'rep_lost_1__rep_found_1',
      lostReportId: 'rep_lost_1',
      foundReportId: 'rep_found_1',
      score: 91,
      tier: 'HIGH',
      usedGemini: false,
      breakdown: { description: 86, category: 100, location: 100, date: 90 },
      matchedTerms: ['white', 'earbuds', 'charging', 'case', 'library'],
      reasons: [
        'Matching terms: white, earbuds, charging, case, library',
        'Same colour (White)',
        'Exact category (Electronics)',
        'Same campus location (Library)',
        'Reported within 24 hours of each other',
      ],
      status: 'ACTIVE',
      createdAt: daysAgoIso(0, 2),
    },
    {
      id: 'match_2',
      matchKey: 'rep_lost_2__rep_found_2',
      lostReportId: 'rep_lost_2',
      foundReportId: 'rep_found_2',
      score: 89,
      tier: 'HIGH',
      usedGemini: false,
      breakdown: { description: 78, category: 100, location: 100, date: 100 },
      matchedTerms: ['black', 'leather', 'wallet', 'canteen'],
      reasons: [
        'Matching terms: black, leather, wallet, canteen',
        'Same colour (Black)',
        'Exact category (Wallets)',
        'Same campus location (Canteen)',
        'Reported within 24 hours of each other',
      ],
      status: 'ACTIVE',
      createdAt: daysAgoIso(2, 3),
    },
    {
      id: 'match_3',
      matchKey: 'rep_lost_3__rep_found_4',
      lostReportId: 'rep_lost_3',
      foundReportId: 'rep_found_4',
      score: 94,
      tier: 'HIGH',
      usedGemini: false,
      breakdown: { description: 84, category: 100, location: 100, date: 100 },
      matchedTerms: ['casio', 'scientific', 'calculator', 'black', 'fx'],
      reasons: [
        'Matching terms: casio, scientific, calculator, black',
        'Same colour (Black)',
        'Exact category (Electronics)',
        'Same campus location (Computer Lab)',
        'Reported within 24 hours of each other',
      ],
      status: 'ACTIVE',
      createdAt: daysAgoIso(3),
    },
  ];

  const recoveryRequests = [
    {
      id: 'RQ1482',
      matchId: 'match_1',
      lostReportId: 'rep_lost_1',
      foundReportId: 'rep_found_1',
      itemName: 'White Wireless Earbuds',
      photoUrl: ITEM_ARTWORKS.earbuds,
      category: 'Electronics',
      ownerId: 'student_aryan',
      ownerName: 'Aryan Sharma',
      finderId: 'student_kunal',
      finderName: 'Kunal Verma',
      status: RECOVERY_STATUS.VERIFICATION_SUBMITTED,
      claimNote: 'I left my AirPods Pro case at the 2nd floor reading table right before 4 PM lecture.',
      adminAssistanceRequested: true,
      meeting: {
        location: 'College Security Office',
        date: dateStrDaysAgo(-1),
        time: '14:00',
        proposedBy: 'student_kunal',
        confirmedByOwner: true,
        confirmedByFinder: true,
      },
      verification: {
        ownerSubmittedDetails: 'Engraved initials A.S. inside the charging case lid and faint blue silicone mark.',
        submittedAt: daysAgoIso(0, 1),
        finderVerified: false,
        adminVerified: false,
        handoverConfirmedByOwner: false,
        handoverConfirmedByFinder: false,
      },
      messages: [
        {
          id: 'msg_1',
          senderId: 'student_aryan',
          senderName: 'Aryan Sharma',
          senderRole: 'student',
          text: 'Hi Kunal! Thanks so much for finding the earbuds case. Happy to meet at the Security Office to verify.',
          createdAt: daysAgoIso(0, 2),
        },
        {
          id: 'msg_2',
          senderId: 'student_kunal',
          senderName: 'Kunal Verma',
          senderRole: 'student',
          text: 'Sure Aryan! Proposed tomorrow 2:00 PM at the College Security Office.',
          createdAt: daysAgoIso(0, 1),
        },
      ],
      createdAt: daysAgoIso(0, 2),
      updatedAt: daysAgoIso(0, 1),
    },
    {
      id: 'RQ1481',
      matchId: 'match_2',
      lostReportId: 'rep_lost_2',
      foundReportId: 'rep_found_2',
      itemName: 'Black Leather Wallet',
      photoUrl: ITEM_ARTWORKS.wallet,
      category: 'Wallets',
      ownerId: 'student_neha',
      ownerName: 'Neha Nair',
      finderId: 'student_rohan',
      finderName: 'Rohan Das',
      status: RECOVERY_STATUS.MEETING_SCHEDULED,
      claimNote: 'Lost near Canteen counter 2 during lunch break.',
      adminAssistanceRequested: true,
      meeting: {
        location: 'College Security Office',
        date: dateStrDaysAgo(-1),
        time: '11:30',
        proposedBy: 'student_rohan',
        confirmedByOwner: true,
        confirmedByFinder: true,
      },
      verification: {
        ownerSubmittedDetails: '',
        submittedAt: null,
        finderVerified: false,
        adminVerified: false,
        handoverConfirmedByOwner: false,
        handoverConfirmedByFinder: false,
      },
      messages: [
        {
          id: 'msg_3',
          senderId: 'student_rohan',
          senderName: 'Rohan Das',
          senderRole: 'student',
          text: 'Deposited the wallet with Campus Security (Shelf SEC-A14). Let us meet there tomorrow at 11:30 AM.',
          createdAt: daysAgoIso(1, 2),
        },
      ],
      createdAt: daysAgoIso(1, 3),
      updatedAt: daysAgoIso(1, 1),
    },
    {
      id: 'RQ1479',
      matchId: 'match_hist_1',
      lostReportId: 'rep_lost_4',
      foundReportId: 'rep_found_6',
      itemName: 'Data Structures Textbook',
      photoUrl: ITEM_ARTWORKS.book,
      category: 'Books',
      ownerId: 'student_aryan',
      ownerName: 'Aryan Sharma',
      finderId: 'student_neha',
      finderName: 'Neha Nair',
      status: RECOVERY_STATUS.COMPLETED,
      claimNote: 'Has yellow sticky tabs on Chapters 4 and 7.',
      adminAssistanceRequested: false,
      meeting: {
        location: 'Main Reception',
        date: dateStrDaysAgo(2),
        time: '16:00',
        proposedBy: 'student_neha',
        confirmedByOwner: true,
        confirmedByFinder: true,
      },
      verification: {
        ownerSubmittedDetails: 'Name written inside front cover + sticky tabs on tree traversal chapter.',
        submittedAt: daysAgoIso(2, 3),
        finderVerified: true,
        adminVerified: true,
        handoverConfirmedByOwner: true,
        handoverConfirmedByFinder: true,
      },
      messages: [],
      createdAt: daysAgoIso(3),
      updatedAt: daysAgoIso(2),
    },
  ];

  const notifications = [
    {
      id: 'notif_1',
      userId: 'student_aryan',
      title: 'High-similarity match found (94%)',
      message: 'SmartFind AI spotted a potential match for "Casio Scientific Calculator" at Computer Lab.',
      type: 'match',
      read: false,
      link: '/student/matches',
      createdAt: daysAgoIso(0, 3),
    },
    {
      id: 'notif_2',
      userId: 'student_aryan',
      title: 'Meeting scheduled for White Wireless Earbuds',
      message: 'Kunal Verma confirmed College Security Office tomorrow at 14:00.',
      type: 'recovery',
      read: false,
      link: '/student/recovery-requests',
      createdAt: daysAgoIso(0, 1),
    },
    {
      id: 'notif_3',
      userId: 'student_kunal',
      title: 'Verification details submitted',
      message: 'Aryan Sharma submitted private identifying details for RQ1482.',
      type: 'verification',
      read: false,
      link: '/student/recovery-requests',
      createdAt: daysAgoIso(0, 1),
    },
    {
      id: 'notif_4',
      userId: 'admin_security',
      title: 'Ownership verification awaiting review',
      message: 'Request #RQ1482 (White Wireless Earbuds) needs Security Admin sign-off.',
      type: 'admin',
      read: false,
      link: '/admin/verification',
      createdAt: daysAgoIso(0, 1),
    },
  ];

  const auditLogs = [
    {
      id: 'audit_1',
      actorId: 'admin_security',
      actorName: 'Security Admin',
      action: 'HELD_ITEM_LOGGED',
      targetId: 'rep_found_2',
      details: 'Logged Black Bi-fold Wallet into Security Vault Shelf SEC-A14.',
      createdAt: daysAgoIso(1, 1),
    },
    {
      id: 'audit_2',
      actorId: 'admin_security',
      actorName: 'Security Admin',
      action: 'HANDOVER_VERIFIED',
      targetId: 'RQ1479',
      details: 'Verified ownership and closed TrustLoop request #RQ1479 (Data Structures Textbook).',
      createdAt: daysAgoIso(2),
    },
  ];

  return {
    users,
    reports,
    reportSecrets,
    matches,
    recoveryRequests,
    notifications,
    auditLogs,
    adminSettings: {
      matchingConfig: DEFAULT_MATCHING_CONFIG,
      requireSecurityHandoverForSensitive: true,
      campusName: 'FoundIt University Campus',
    },
  };
}
