package org.hk.flixly.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Avatar dosyalarını merkezden kare kırpıp yüksek kaliteli JPEG olarak kaydeder.
 */
@Service
public class AvatarStorageService {

    /** Retina / büyük avatarlar için yeterli çözünürlük */
    public static final int AVATAR_SIZE = 1024;
    /** 0.92 — gözle fark edilmeyen kayıp, dosya boyutu makul */
    private static final float JPEG_QUALITY = 0.92f;

    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private final Path root;

    public AvatarStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.root = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
        Files.createDirectories(this.root);
    }

    public String store(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dosya seçilmedi");
        }
        String contentType = file.getContentType() != null
                ? file.getContentType().toLowerCase(Locale.ROOT)
                : "";
        if (!ALLOWED.contains(contentType)) {
            throw new IllegalArgumentException("Yalnızca JPEG, PNG, WEBP veya GIF yükleyebilirsin");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Dosya en fazla 2MB olabilir");
        }

        BufferedImage source;
        try (InputStream in = file.getInputStream()) {
            source = ImageIO.read(in);
        }
        if (source == null) {
            throw new IllegalArgumentException("Görsel okunamadı. Geçerli bir fotoğraf seç.");
        }

        BufferedImage square = centerCropSquare(source);
        int side = square.getWidth();
        // Küçük görselleri büyütme — kalite kaybı olmasın; büyükleri max 1024'e indir
        int targetSize = Math.min(AVATAR_SIZE, side);
        BufferedImage resized = side == targetSize ? toRgb(square) : resize(square, targetSize);

        String filename = "u" + userId + "-" + UUID.randomUUID().toString().substring(0, 8) + ".jpg";
        Path target = root.resolve(filename);
        writeJpeg(resized, target, JPEG_QUALITY);
        return "/uploads/avatars/" + filename;
    }

    /** Merkezden kare kırp — oran bozulmaz, kenarlar kesilir. */
    static BufferedImage centerCropSquare(BufferedImage src) {
        int w = src.getWidth();
        int h = src.getHeight();
        int side = Math.min(w, h);
        int x = (w - side) / 2;
        int y = (h - side) / 2;
        return src.getSubimage(x, y, side, side);
    }

    static BufferedImage toRgb(BufferedImage src) {
        if (src.getType() == BufferedImage.TYPE_INT_RGB) {
            return src;
        }
        BufferedImage out = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, out.getWidth(), out.getHeight());
            g.drawImage(src, 0, 0, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    static BufferedImage resize(BufferedImage src, int size) {
        BufferedImage out = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, size, size);
            g.drawImage(src, 0, 0, size, size, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    static void writeJpeg(BufferedImage image, Path target, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            ImageIO.write(image, "jpg", target.toFile());
            return;
        }
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        if (param.canWriteCompressed()) {
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
        }
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(Files.newOutputStream(target))) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }
}
