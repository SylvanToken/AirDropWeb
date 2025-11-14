# Implementation Plan

- [x] 1. Proje yapısını ve temel dosyaları oluştur





  - `tools/task-manager/` klasör yapısını oluştur
  - TypeScript tip tanımlarını yaz (`types/index.ts`)
  - Temel sayfa dosyasını oluştur (`page.tsx`)
  - _Requirements: 1.1, 7.1, 7.4_

- [x] 2. Task Parser implementasyonu






- [x] 2.1 TaskParser sınıfını oluştur

  - TASK_CATALOG.md'yi parse eden `parse()` metodunu yaz
  - Kategori çıkarma metodunu implement et
  - Task detaylarını parse eden regex pattern'leri yaz
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 Parser'ı test et ve hata yönetimi ekle


  - Parse error handling ekle
  - Fallback mekanizması oluştur
  - _Requirements: 1.1_

- [x] 3. LocalStorage state yönetimi





- [x] 3.1 TaskStateManager sınıfını oluştur


  - `loadState()` ve `saveState()` metodlarını yaz
  - `updateTask()` ve `bulkUpdate()` metodlarını implement et
  - State schema'sını tanımla
  - _Requirements: 2.3, 2.4, 3.5, 7.1_

- [x] 3.2 LocalStorage quota error handling


  - QuotaExceededError yakalama ekle
  - Kullanıcı uyarı sistemi oluştur
  - _Requirements: 7.1_

- [x] 4. Export Manager implementasyonu






- [x] 4.1 TaskExporter sınıfını oluştur

  - JSON export metodunu yaz
  - SQL export metodunu yaz
  - String escape fonksiyonu ekle
  - _Requirements: 6.1, 6.2_


- [x] 4.2 Dosya indirme fonksiyonunu implement et

  - Blob oluşturma ve download trigger
  - Dosya adı formatlaması
  - _Requirements: 6.3_

- [x] 5. TaskCard component'ini oluştur





  - Görev kartı UI'ını tasarla
  - Checkbox ve seçim state'ini implement et
  - Puan badge'ini renk kodlu olarak ekle
  - "Pasife Al" butonu ve fonksiyonalitesi
  - Completed durumu için gri/soluk görünüm
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [x] 6. TaskGrid component'ini oluştur






  - Grid layout (responsive 3-4 kolon) oluştur
  - TaskCard'ları render et
  - Empty state UI'ı ekle
  - _Requirements: 1.1, 1.2_

- [x] 7. CategoryFilter component'ini oluştur



  - Tab-style kategori seçimi UI'ı
  - Her kategorinin görev sayısını göster
  - "ALL" seçeneği ekle
  - Aktif kategori vurgulama
  - _Requirements: 1.3, 1.4, 5.2_

- [x] 8. SearchBar component'ini oluştur





  - Arama input'u ekle
  - Durum dropdown'u (ALL/ACTIVE/COMPLETED/SELECTED)
  - Puan aralığı slider'ı
  - Debounced search implementasyonu
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [x] 9. BulkActions component'ini oluştur





  - "Tümünü Seç" butonu ve fonksiyonu
  - "Seçimi Temizle" butonu
  - "Seçilenleri Pasife Al" butonu
  - Seçili görev sayısı göstergesi
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10. ExportModal component'ini oluştur





  - Modal UI'ı (açma/kapama)
  - Format seçimi (JSON/SQL radio buttons)
  - Önizleme alanı (code block)
  - "İndir" ve "Kopyala" butonları
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. StatsPanel component'ini oluştur





  - Toplam görev sayısı göstergesi
  - Seçili görev sayısı
  - Pasif görev sayısı
  - Toplam puan hesaplama (seçili görevler)
  - Kategori dağılımı görselleştirmesi
  - _Requirements: 1.4, 2.5_

- [x] 12. Ana sayfa (page.tsx) entegrasyonu




- [x] 12.1 State management ve data loading


  - TASK_CATALOG.md'yi fetch et
  - Parser ile parse et
  - localStorage state'i yükle ve merge et
  - Loading state'i yönet
  - _Requirements: 1.1, 2.4, 7.1, 7.4_

- [x] 12.2 Filtreleme logic'ini implement et


  - useMemo ile filtreleme optimizasyonu
  - Kategori, durum, puan, arama filtrelerini uygula
  - Filtrelenmiş task listesini hesapla
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12.3 Event handler'ları ekle


  - handleToggleSelect fonksiyonu
  - handleToggleComplete fonksiyonu
  - handleBulkActions fonksiyonları
  - handleExport fonksiyonu
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 6.1_

- [x] 12.4 Layout ve component'leri render et


  - Header ve başlık
  - StatsPanel yerleştirme
  - Sidebar (CategoryFilter) ve main content layout
  - SearchBar, BulkActions, TaskGrid sıralama
  - ExportModal entegrasyonu
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 13. Styling ve responsive design





  - Tailwind CSS ile component styling
  - Responsive grid layout (mobile, tablet, desktop)
  - Color scheme (selected, completed, active)
  - Point badge renkleri (Gray/Blue/Purple/Orange)
  - Hover ve focus state'leri
  - _Requirements: 2.2, 3.2, 3.3_

- [x] 14. Error handling ve edge cases





  - File read error handling ve retry
  - Parse error handling ve fallback
  - localStorage quota error handling
  - Empty state handling
  - Network error handling
  - _Requirements: 7.1, 7.4_

- [x] 15. Performance optimizasyonu





  - useMemo ile filtreleme optimizasyonu
  - useCallback ile event handler optimizasyonu
  - Debounced search implementasyonu
  - Kategori sayılarını memoize et
  - _Requirements: 5.5_

- [x] 16. Final testing ve polish




  - Tüm fonksiyonaliteleri manuel test et
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Mobile responsive test
  - localStorage persistence test
  - Export fonksiyonlarını test et
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_
