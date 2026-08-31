package org.hk.flixly;

import org.hk.flixly.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class FlixlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlixlyApplication.class, args);
	}

}
