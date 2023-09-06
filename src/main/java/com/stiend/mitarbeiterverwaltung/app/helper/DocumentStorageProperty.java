package com.stiend.mitarbeiterverwaltung.app.helper;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "document")
public class DocumentStorageProperty {
	private String uploadDirectory;

	public String getUploadDirectory() {
		return uploadDirectory;
	}
}
