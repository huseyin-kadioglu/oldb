package org.hk.flixly;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("local")
@TestPropertySource(properties = {
		"spring.datasource.url=jdbc:postgresql://localhost:5432/oldb_ci",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"app.mail.enabled=false",
		"security.jwt.secret-key=bG9jYWwtZGV2LW9ubHktand0LXNlY3JldC1yb3RhdGUtMzI=",
		"security.jwt.expiration-time=3600000",
		"catalog.openlibrary.import-on-empty=false"
})
class FlixlyApplicationTests {

	@Test
	void contextLoads() {
	}

}
