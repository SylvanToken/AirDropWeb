# Requirements Document

## Introduction

Lokal geliştirme ortamında kullanılmak üzere, veritabanı bağlantısı gerektirmeyen, bağımsız bir task yönetim aracı. TASK_CATALOG.md dosyasındaki görev listelerini görüntüleyip, seçim yaparak sisteme aktarılacak görevleri yönetmeyi sağlar.

## Glossary

- **Local Task Manager**: Veritabanı bağlantısı olmadan çalışan, localStorage tabanlı görev yönetim aracı
- **Task Catalog**: docs/TASK_CATALOG.md dosyasında tanımlı 100 görev listesi
- **Task Selection**: Kullanıcının katalogdan görev seçme işlemi
- **Task Status**: Görevin aktif veya pasif durumu (selected/unselected)
- **Admin Interface**: Sadece lokal kullanım için oluşturulan yönetim arayüzü

## Requirements

### Requirement 1

**User Story:** Geliştirici olarak, TASK_CATALOG.md dosyasındaki tüm görevleri kategorilere göre görüntülemek istiyorum, böylece hangi görevlerin mevcut olduğunu görebilirim.

#### Acceptance Criteria

1. WHEN Local Task Manager açıldığında, THE System SHALL TASK_CATALOG.md dosyasını okuyarak tüm görevleri kategorilere göre gruplandırılmış şekilde görüntüleyecek
2. THE System SHALL her görev için başlık, açıklama, puan, tip ve URL bilgilerini gösterecek
3. THE System SHALL görevleri Twitter, Telegram, Social Media, Referral ve Profile kategorilerine göre organize edecek
4. THE System SHALL her kategorideki görev sayısını görsel olarak gösterecek

### Requirement 2

**User Story:** Geliştirici olarak, katalogdaki görevleri seçip işaretlemek istiyorum, böylece hangi görevleri sisteme gireceğimi belirleyebilirim.

#### Acceptance Criteria

1. WHEN bir görev kartına tıklandığında, THE System SHALL görevin seçili/seçili değil durumunu değiştirecek
2. THE System SHALL seçili görevleri görsel olarak farklı bir şekilde (örn. yeşil border, checkbox) gösterecek
3. THE System SHALL seçim durumunu localStorage'da saklayacak
4. THE System SHALL sayfa yenilendiğinde seçim durumlarını koruyacak
5. THE System SHALL seçili görev sayısını anlık olarak gösterecek

### Requirement 3

**User Story:** Geliştirici olarak, seçtiğim görevleri pasife alabilmek istiyorum, böylece sisteme girdiğim görevleri katalogdan ayırabilirim.

#### Acceptance Criteria

1. WHEN bir görev seçiliyken "Pasife Al" butonuna tıklandığında, THE System SHALL görevin durumunu "completed" olarak işaretleyecek
2. THE System SHALL pasif görevleri soluk/gri renkte gösterecek
3. THE System SHALL pasif görevleri aktif görevlerden görsel olarak ayırt edilebilir hale getirecek
4. THE System SHALL pasif görevlerin tekrar aktif hale getirilmesine izin verecek
5. THE System SHALL tüm durum değişikliklerini localStorage'da saklayacak

### Requirement 4

**User Story:** Geliştirici olarak, seçili görevleri toplu olarak yönetmek istiyorum, böylece hızlı işlem yapabilirim.

#### Acceptance Criteria

1. THE System SHALL "Tümünü Seç" butonu ile tüm görevleri seçme özelliği sunacak
2. THE System SHALL "Seçimi Temizle" butonu ile tüm seçimleri kaldırma özelliği sunacak
3. THE System SHALL "Seçilenleri Pasife Al" butonu ile seçili tüm görevleri toplu pasife alma özelliği sunacak
4. THE System SHALL kategori bazında toplu seçim yapma özelliği sunacak
5. THE System SHALL işlem sonrası başarı mesajı gösterecek

### Requirement 5

**User Story:** Geliştirici olarak, görevleri filtreleyip arama yapabilmek istiyorum, böylece ihtiyacım olan görevi hızlıca bulabilirim.

#### Acceptance Criteria

1. THE System SHALL görev başlığı ve açıklamasında arama yapma özelliği sunacak
2. THE System SHALL kategoriye göre filtreleme özelliği sunacak
3. THE System SHALL puan aralığına göre filtreleme özelliği sunacak
4. THE System SHALL duruma göre (aktif/pasif/seçili) filtreleme özelliği sunacak
5. WHEN arama veya filtre uygulandığında, THE System SHALL sonuçları anlık olarak güncelleyecek

### Requirement 6

**User Story:** Geliştirici olarak, seçtiğim görevleri dışa aktarabilmek istiyorum, böylece sisteme kolayca girebilirim.

#### Acceptance Criteria

1. THE System SHALL seçili görevleri JSON formatında dışa aktarma özelliği sunacak
2. THE System SHALL seçili görevleri SQL INSERT formatında dışa aktarma özelliği sunacak
3. THE System SHALL dışa aktarılan dosyayı otomatik olarak indirme özelliği sunacak
4. THE System SHALL dışa aktarma öncesi önizleme gösterecek
5. THE System SHALL dışa aktarma formatını kullanıcının seçmesine izin verecek

### Requirement 7

**User Story:** Geliştirici olarak, aracın tamamen bağımsız çalışmasını istiyorum, böylece veritabanı bağlantısı olmadan kullanabilirim.

#### Acceptance Criteria

1. THE System SHALL tüm veriyi localStorage'da saklayacak
2. THE System SHALL hiçbir API çağrısı yapmayacak
3. THE System SHALL hiçbir veritabanı bağlantısı gerektirmeyecek
4. THE System SHALL tamamen client-side çalışacak
5. THE System SHALL offline çalışabilecek
