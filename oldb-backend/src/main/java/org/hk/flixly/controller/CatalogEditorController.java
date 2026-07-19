package org.hk.flixly.controller;

import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.BookApprovalDto;
import org.hk.flixly.model.CatalogBookDto;
import org.hk.flixly.model.CatalogDuplicateCheckDto;
import org.hk.flixly.model.IsbnLookupDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.service.AuthorService;
import org.hk.flixly.service.BookService;
import org.hk.flixly.service.CatalogGenreCatalog;
import org.hk.flixly.service.OpenLibraryImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin / moderatör katalog editörü. Community katkı akışının aksine
 * onay kuyruğu yoktur; kayıtlar doğrudan canlı katalog tablolarına yazılır.
 */
@CrossOrigin
@RestController
@RequestMapping("/admin/catalog")
public class CatalogEditorController {

    private final AuthorService authorService;
    private final BookService bookService;
    private final OpenLibraryImportService openLibraryImportService;

    public CatalogEditorController(
            AuthorService authorService,
            BookService bookService,
            OpenLibraryImportService openLibraryImportService
    ) {
        this.authorService = authorService;
        this.bookService = bookService;
        this.openLibraryImportService = openLibraryImportService;
    }

    private boolean isStaff(UserDetails userDetails) {
        return userDetails instanceof UserEntity actor && UserRole.isStaff(actor.getRole());
    }

    private String actorName(UserDetails userDetails) {
        if (userDetails instanceof UserEntity u) {
            if (u.getUsername() != null && !u.getUsername().isBlank()) return u.getUsername();
            return u.getEmail();
        }
        return userDetails != null ? userDetails.getUsername() : null;
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("message", "Bu işlem için yetkiniz yok."));
    }

    @PostMapping("/authors")
    public ResponseEntity<?> createAuthor(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AuthorApprovalDto dto
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            AuthorEntity saved = authorService.createAuthorDirect(dto);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/authors/{id}")
    public ResponseEntity<?> getAuthor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            return ResponseEntity.ok(authorService.getAuthorEntity(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/authors/{id}")
    public ResponseEntity<?> updateAuthor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AuthorApprovalDto dto
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            AuthorEntity saved = authorService.updateAuthorDirect(id, dto);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/books")
    public ResponseEntity<?> createBook(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody BookApprovalDto dto
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            CatalogBookDto saved = bookService.createBookDirect(dto, actorName(userDetails));
            return ResponseEntity.ok(saved);
        } catch (BookService.WeeklyPickConflictException e) {
            return weeklyConflict(e);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<?> getBook(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            return ResponseEntity.ok(bookService.getCatalogBook(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<?> updateBook(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody BookApprovalDto dto
    ) {
        if (!isStaff(userDetails)) return forbidden();
        try {
            CatalogBookDto saved = bookService.updateBookDirect(id, dto, actorName(userDetails));
            return ResponseEntity.ok(saved);
        } catch (BookService.WeeklyPickConflictException e) {
            return weeklyConflict(e);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/duplicates")
    public ResponseEntity<?> checkDuplicates(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody BookApprovalDto dto,
            @RequestParam(required = false) Long excludeId
    ) {
        if (!isStaff(userDetails)) return forbidden();
        CatalogDuplicateCheckDto result = bookService.findDuplicates(dto, excludeId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<?> lookupIsbn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String isbn
    ) {
        if (!isStaff(userDetails)) return forbidden();
        IsbnLookupDto result = openLibraryImportService.lookupByIsbn(isbn);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/genres")
    public ResponseEntity<?> genres(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String q
    ) {
        if (!isStaff(userDetails)) return forbidden();
        List<String> list = CatalogGenreCatalog.search(q);
        return ResponseEntity.ok(Map.of("genres", list));
    }

    private ResponseEntity<?> weeklyConflict(BookService.WeeklyPickConflictException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", "WEEKLY_PICK_CONFLICT");
        body.put("message", e.getMessage());
        body.put("current", e.getCurrent());
        return ResponseEntity.status(409).body(body);
    }
}
