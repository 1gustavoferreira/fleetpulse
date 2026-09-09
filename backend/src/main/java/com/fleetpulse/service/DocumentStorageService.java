package com.fleetpulse.service;

import com.fleetpulse.domain.TripDocument;
import com.fleetpulse.repository.TripDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentStorageService {

    private final TripDocumentRepository tripDocumentRepository;

    @Value("${app.storage.documents-dir:./uploads/documents}")
    private String storageDir;

    public TripDocument storeDocument(Long tripId, String docType, MultipartFile file, Long userId) throws IOException {
        Path uploadPath = Paths.get(storageDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "doc.bin";
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(storedFilename);

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        TripDocument document = TripDocument.builder()
                .tripId(tripId)
                .docType(docType.toUpperCase().trim())
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .contentType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .uploadedByUserId(userId)
                .build();

        return tripDocumentRepository.save(document);
    }
}