package com.c102.malanglab.game.adapter.s3;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class S3Uploader {
    @Autowired
    private AmazonS3Client amazonS3Client;
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String uploadFile(MultipartFile multipartFile, String filePath) {
        String fileName = filePath + createFilename(multipartFile.getOriginalFilename());
        String fileUrl = "";
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentLength(multipartFile.getSize());
        objectMetadata.setContentType(multipartFile.getContentType());

        try (InputStream inputStream = multipartFile.getInputStream()) {
            amazonS3Client.putObject(new PutObjectRequest(bucket, fileName, inputStream, objectMetadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));
            fileUrl = amazonS3Client.getUrl(bucket, fileName).toString();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 업로드에 실패했습니다.");
        }

        return fileUrl;
    }

    private String createFilename(String fileName) {
        return UUID.randomUUID().toString().concat(getFileExtension(fileName));
    }

    private String getFileExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf("."));
        } catch (StringIndexOutOfBoundsException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 형식의 파일(\" + fileName + \") 입니다.");
        }
    }

    public void removeFile(String key) {
        try {
            amazonS3Client.deleteObject(
                    bucket,
                    key.replace("https://s3.ap-northeast-2.amazonaws.com/static.malang-lab.com/", "")
            );
        } catch(AmazonServiceException e) {
            log.error("Amazon S3에서 Object를 제거할 수 없습니다 -> {}", e.getMessage());
        } catch(SdkClientException e) {
            log.error("Amazon S3로부터 응답을 처리할 수 없습니다 -> {}", e.getMessage());
        } catch(Exception e) {
            log.error("이미지를 제거하는 데 문제가 발생했습니다 -> {}", e.getMessage());
        }
    }

    public void removeAll(Long roomId) {
        ListObjectsV2Result result = amazonS3Client.listObjectsV2(bucket, "room/" + roomId + "/");
        for(S3ObjectSummary summary : result.getObjectSummaries()) {
            amazonS3Client.deleteObject(bucket, summary.getKey());
        }
        amazonS3Client.deleteObject(bucket, "room/" + roomId + "/");
    }
}
