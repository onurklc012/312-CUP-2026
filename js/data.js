// ============================================================
// 312 CUP 2026 SEZONU — TURNUVA VERİLERİ
// Bu dosya admin panelinden dışa aktarılarak güncellenir.
// ============================================================

const TOURNAMENT_DATA = {
    // ----------------------------------------------------------
    // TAKIMLAR
    // ----------------------------------------------------------
    teams: {
        maintenance: {
            id: 'maintenance',
            name: 'MAINTENANCE CITY',
            shortName: 'MNC',
            vardiya: 'A Vardiyası',
            logo: 'assets/logos/maintenance.png',
            color: '#1b3a6b',
            colorSecondary: '#5ba3d9'
        },
        gobeklitepe: {
            id: 'gobeklitepe',
            name: 'GÖBEKLİTEPE FK',
            shortName: 'GÖB',
            vardiya: 'Mesai Ekibi',
            logo: 'assets/logos/gobeklitepe.png',
            color: '#1a5e1f',
            colorSecondary: '#4caf50'
        },
        cforce: {
            id: 'cforce',
            name: 'C-FORCE',
            shortName: 'CFC',
            vardiya: 'C Vardiyası',
            logo: 'assets/logos/cforce.png',
            color: '#b8860b',
            colorSecondary: '#ffd700'
        },
        planb: {
            id: 'planb',
            name: 'PLAN B',
            shortName: 'PLB',
            vardiya: 'B Vardiyası',
            logo: 'assets/logos/planb.png',
            color: '#1a237e',
            colorSecondary: '#ffd700'
        },
        delta: {
            id: 'delta',
            name: 'DELTA UNITED',
            shortName: 'DLT',
            vardiya: 'D Vardiyası',
            logo: 'assets/logos/deltaunited.png',
            color: '#263238',
            colorSecondary: '#4fc3f7'
        }
    },

    // ----------------------------------------------------------
    // FİKSTÜR
    // ----------------------------------------------------------
    fixtures: [
        // HAFTA 1 — 08.04.2026
        { id: 1,  week: 1, date: '2026-04-08', time: '21:00', home: 'delta',       away: 'maintenance' },
        { id: 2,  week: 1, date: '2026-04-08', time: '22:00', home: 'planb',       away: 'gobeklitepe' },
        // HAFTA 2 — 13.04.2026
        { id: 3,  week: 2, date: '2026-04-13', time: '21:00', home: 'gobeklitepe', away: 'maintenance' },
        { id: 4,  week: 2, date: '2026-04-13', time: '22:00', home: 'cforce',      away: 'delta' },
        // HAFTA 3 — 18.04.2026
        { id: 5,  week: 3, date: '2026-04-18', time: '21:00', home: 'cforce',      away: 'planb' },
        { id: 6,  week: 3, date: '2026-04-18', time: '22:00', home: 'delta',       away: 'gobeklitepe' },
        // HAFTA 4 — 23.04.2026
        { id: 7,  week: 4, date: '2026-04-23', time: '21:00', home: 'gobeklitepe', away: 'cforce' },
        { id: 8,  week: 4, date: '2026-04-23', time: '22:00', home: 'maintenance', away: 'planb' },
        // HAFTA 5 — 27.04.2026
        { id: 9,  week: 5, date: '2026-04-27', time: '21:00', home: 'maintenance', away: 'cforce' },
        // HAFTA 6 — 28.04.2026
        { id: 10, week: 6, date: '2026-04-28', time: '21:00', home: 'planb',       away: 'delta' }
    ],

    // ----------------------------------------------------------
    // MAÇ SONUÇLARI (Admin panelinden güncellenir)
    // Format: { matchId: { homeScore: X, awayScore: Y, played: true } }
    // ----------------------------------------------------------
    results: {},

    // ----------------------------------------------------------
    // GOLLER (Admin panelinden güncellenir)
    // Format: [{ matchId, player, teamId, minute }]
    // ----------------------------------------------------------
    goals: [],

    // ----------------------------------------------------------
    // KURALLAR
    // ----------------------------------------------------------
    rules: [
        "Hakeme kesinlikle ve kesinlikle itiraz edilmeyecektir.",
        "Kırmızı kart gören oyuncu oyundan çıkacak, kalan kişimda takımı eksik devam edecek.",
        "Kırmızı kart gören oyuncu bir sonraki maç cezalı olmayacaktır.",
        "Maçlar tek maç statüsünde oynanacaktır.",
        "Galibiyet 3 puan, beraberlik 1 puan olarak puanlandırılacaktır.",
        "İki takım aynı puana sahipse gol averajı fazla olan takım üst sırada olacaktır.",
        "Takımların verdiği listenin dışında başka oyuncu oynamayacaktır.",
        "Oyuncu değişiklik hakkı sınırsız olacaktır.",
        "Oyundan çıkan oyuncu tekrar oyuna alınmayacaktır.",
        "Oyuna giren oyuncu tekrar oyundan çıkabilir.",
        "Fikstürde ev sahibi olarak görünen takım sarı forma, deplasman olarak görünen takım kırmızı forma ile mücadele edecektir.",
        "Takım başına saha ücreti ve maç sonu artı kazanan takıma ödül verileceği için 7.000 TL toplanacaktır.",
        "Saha ücreti maç başı 3.500 TL iken biz 2.800 TL olarak anlaştık bilginize.",
        "Halısahaya toplam organizasyon için 10 maç ücreti olan 28.000 TL toplu ödenecektir.",
        "Ödeme 01.04.2026 Çarşamba günü yapılacaktır.",
        "Takımların kendilerine düşen 7.000 TL ücreti en geç Çarşamba akşama kadar bana tek elden teslim etmeleri gerekmektedir.",
        "Son olarak sizden ricam daha önce gerçekleştirdiğimiz turnuva gibi fair play çerçevesinde oynayalım. Birbirimize askerlik yapmayalım. Amacın sosyalleşmek ve kaynaşmak olduğunu unutmayalım."
    ]
};
