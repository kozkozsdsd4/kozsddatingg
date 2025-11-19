# Raspberry Pi 5 SSD Tanıma ve Kurtarma Rehberi

## Sorun Tanımı

Raspberry Pi 5'inizde SSD'nin tanınmaması ve silinen dosyaların kurtarılması için bu rehber hazırlanmıştır.

## 🚨 Acil Durum Çözümleri

### 1. SSD'yi Yeniden Tanıtma

SSD'niz boot sırasında tanınmıyorsa, önce bağlantıyı kontrol edin:

```bash
# Bağlı disk ve bölümleri listele
lsblk

# USB/SATA cihazlarını kontrol et
sudo dmesg | grep -i ssd
sudo dmesg | grep -i usb

# Disk tanıma durumunu kontrol et
sudo fdisk -l
```

### 2. Kritik Dosyaları Kurtarma

Eğer dosyalar silinmişse, **derhal diski kullanmayı durdurun**:

```bash
# TestDisk ile dosya kurtarma (kurulu değilse önce kurun)
sudo apt update
sudo apt install testdisk

# TestDisk'i başlat
sudo testdisk

# Veya PhotoRec kullanarak:
sudo photorec
```

**ÖNEMLİ**: Silinen dosyaların üzerine yeni veri yazılmaması için diski salt okunur (read-only) modda mount edin:

```bash
sudo mount -o ro /dev/sda1 /mnt/recovery
```

## 🔧 SSD Tanıma Sorunlarının Çözümü

### A. Bağlantı ve Güç Sorunları

```bash
# USB bağlantılarını yeniden tara
sudo udevadm trigger

# Kernel modüllerini yeniden yükle
sudo modprobe -r uas
sudo modprobe uas
```

### B. Dosya Sistemi Kontrolü

```bash
# Dosya sistemini kontrol et ve onar (SSD'yi unmount ettikten sonra)
sudo umount /dev/sda1
sudo fsck -y /dev/sda1

# Ext4 için özel kontrol
sudo e2fsck -f /dev/sda1
```

### C. Partition Table Kurtarma

```bash
# Partition table'ı görüntüle
sudo gdisk -l /dev/sda

# Veya parted kullanarak:
sudo parted /dev/sda print

# Zarar görmüş partition table'ı onar
sudo testdisk /dev/sda
```

### D. fstab Dosyası Düzeltme

Silinen dosyalar `/etc/fstab`'ı etkilemişse:

```bash
# SD karttan boot ettikten sonra:
sudo nano /etc/fstab

# Hatalı veya eksik girişleri düzeltin
# UUID'leri kontrol etmek için:
sudo blkid

# Örnek doğru fstab girişi:
# UUID=xxxx-xxxx /mnt/ssd ext4 defaults,nofail 0 2
```

**Önemli**: `nofail` parametresi, disk bulunamazsa sistemin boot etmeye devam etmesini sağlar.

## 📋 Boot Yapılandırması

### cmdline.txt Kontrolü

```bash
# Boot parametrelerini kontrol et
sudo nano /boot/firmware/cmdline.txt

# Root device'ın doğru olduğundan emin ol:
# root=/dev/mmcblk0p2 (SD kart için)
# root=/dev/sda2 (SSD için)
```

### config.txt Kontrolü

```bash
sudo nano /boot/firmware/config.txt

# USB boot desteğinin aktif olduğundan emin ol
# Gerekirse ekle:
# otg_mode=1
```

## 🔄 SD Karttan SSD'ye Geçiş

### 1. Veriyi SD Karttan SSD'ye Klonlama

```bash
# SD karttaki tüm veriyi SSD'ye kopyala
sudo dd if=/dev/mmcblk0 of=/dev/sda bs=4M status=progress conv=fsync

# Veya rsync ile daha güvenli:
sudo rsync -aAXv --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} / /mnt/ssd/
```

### 2. UUID'leri Güncelleme

```bash
# Yeni UUID oluştur (gerekirse)
sudo tune2fs /dev/sda2 -U random

# Yeni UUID'yi öğren
sudo blkid /dev/sda2

# fstab'ı güncelle
sudo nano /etc/fstab
```

### 3. Bootloader'ı Güncelleme

```bash
# SSD'ye bootloader kur
sudo mkdir -p /mnt/ssd
sudo mount /dev/sda2 /mnt/ssd
sudo mount /dev/sda1 /mnt/ssd/boot/firmware

# fstab'ı SSD üzerinde güncelle
sudo nano /mnt/ssd/etc/fstab

# cmdline.txt'yi güncelle
sudo nano /mnt/ssd/boot/firmware/cmdline.txt
```

## 🛡️ Önleyici Tedbirler

### Düzenli Yedekleme Stratejisi

```bash
# Otomatik yedekleme scripti oluştur
sudo nano /usr/local/bin/backup-to-sd.sh
```

Script içeriği:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/media/sd-backup"
SOURCE_DIR="/"

# Kritik dizinleri yedekle
rsync -aAXv \
  --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*"} \
  $SOURCE_DIR $BACKUP_DIR/backup-$DATE/

# 7 günden eski yedekleri sil
find $BACKUP_DIR -type d -name "backup-*" -mtime +7 -exec rm -rf {} \;
```

Scripti çalıştırılabilir yap:
```bash
sudo chmod +x /usr/local/bin/backup-to-sd.sh

# Crontab'a ekle (her gün gece 2'de)
sudo crontab -e
# Ekle: 0 2 * * * /usr/local/bin/backup-to-sd.sh
```

### Sistem Sağlık Kontrolü

```bash
# Disk sağlığını düzenli kontrol et
sudo smartctl -a /dev/sda

# Dosya sistemi hatalarını kontrol et
sudo dmesg | grep -i error

# SSD wear level kontrolü
sudo smartctl -A /dev/sda | grep Wear
```

## 🔍 Sorun Giderme Komutları

### Detaylı Disk Bilgisi

```bash
# Tüm disk bilgilerini topla
sudo lshw -class disk
sudo hdparm -I /dev/sda

# Kernel ring buffer'ı kontrol et
sudo dmesg | tail -50

# Sistem loglarını incele
sudo journalctl -xe | grep -i disk
sudo journalctl -xe | grep -i ssd
```

### USB/SATA Controller Kontrolü

```bash
# USB kontrolör durumunu kontrol et
lsusb -t

# PCI cihazlarını listele
lspci -v | grep -i sata

# USB güç yönetimini devre dışı bırak (sorun yaratabilir)
echo -1 | sudo tee /sys/module/usbcore/parameters/autosuspend
```

## 📞 Ek Kaynaklar

- [Raspberry Pi Resmi Dokümantasyon](https://www.raspberrypi.com/documentation/)
- [TestDisk Kullanım Kılavuzu](https://www.cgsecurity.org/wiki/TestDisk)
- [Raspberry Pi Forum](https://forums.raspberrypi.com/)

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Veri kurtarma işlemi öncesinde asla diski kullanmayın**
2. **Her işlem öncesi yedek alın**
3. **Güç kaynağınızın yeterli olduğundan emin olun** (Raspberry Pi 5 için 5V/5A adaptör önerilir)
4. **SSD'nin USB adaptörü kullanıyorsanız, adaptörün USB 3.0 uyumlu olduğundan emin olun**
5. **Uzun işlemler sırasında güç kesilmesini önleyin**

## 🎯 Hızlı Kontrol Listesi

- [ ] SSD fiziksel olarak bağlı mı?
- [ ] Güç kaynağı yeterli mi? (5V/5A)
- [ ] `lsblk` komutu SSD'yi gösteriyor mu?
- [ ] `/etc/fstab` dosyası düzgün mü?
- [ ] `/boot/firmware/cmdline.txt` doğru root device'ı gösteriyor mu?
- [ ] Dosya sistemi hatası var mı? (`fsck` çalıştır)
- [ ] Partition table sağlıklı mı? (`fdisk -l` kontrol et)
- [ ] USB/SATA controller tanınıyor mu?
- [ ] Kernel loglarında hata var mı? (`dmesg | grep -i error`)

---

**Not**: Bu rehber Raspberry Pi 5 için optimize edilmiştir, ancak diğer Raspberry Pi modelleri için de genel hatlarıyla geçerlidir.
