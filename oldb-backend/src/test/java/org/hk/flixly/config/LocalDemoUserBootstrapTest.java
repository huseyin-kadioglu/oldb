package org.hk.flixly.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalDemoUserBootstrapTest {

    @Test
    void acceptsOnlyLoopbackJdbcHosts() {
        assertTrue(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://localhost:5432/mydatabase"));
        assertTrue(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://127.0.0.1:5432/mydatabase?sslmode=disable"));
        assertTrue(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://user:secret@LOCALHOST:5432/mydatabase"));
        assertTrue(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://[::1]:5432/mydatabase"));

        assertFalse(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://postgres.railway.internal:5432/railway"));
        assertFalse(LocalDemoUserBootstrap.isLocalDatasource(
                "jdbc:postgresql://db:5432/mydatabase"));
        assertFalse(LocalDemoUserBootstrap.isLocalDatasource(""));
        assertFalse(LocalDemoUserBootstrap.isLocalDatasource(null));
    }
}
