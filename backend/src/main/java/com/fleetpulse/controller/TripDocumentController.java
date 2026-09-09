package com.fleetpulse.controller;

import com.fleetpulse.domain.TripDocument;
import com.fleetpulse.domain.User;
import com.fleetpulse.repository.UserRepository;
import com.fleetpulse.service.DocumentStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Cofre Fiscal & Documentos", description = "Armazenamento e auditoria de CT-e, DACTE e comprovantes")
public class TripDocumentController {

    private final DocumentStorageService documentStorageService;
    private final UserRepository userRepository;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Armazenar documento fiscal associado à viagem com auditoria")
    public ResponseEntity<TripDocument> uploadDocument(
            @RequestParam("tripId") Long tripId,
            @RequestParam("docType") String docType,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {
        Long userId = null;
        if (authentication != null && authentication.getName() != null) {
            userId = userRepository.findByEmail(authentication.getName())
                    .map(User::getId)
                    .orElse(null);
        }

        TripDocument savedDoc = documentStorageService.storeDocument(tripId, docType, file, userId);
        return ResponseEntity.ok(savedDoc);
    }
}