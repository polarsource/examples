package com.example.polar;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PolarApplication {

	public static void main(String[] args) {
		SpringApplication.run(PolarApplication.class, args);
	}

	@Bean
	public Dotenv dotenv() {
		return Dotenv.configure()
				.ignoreIfMissing()
				.load();
	}
}
