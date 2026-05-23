package com.mmu.shuttle.backend.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class SchedulerConfig {

    @Bean(name = "googleApiScheduler")
    public TaskScheduler googleApiScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(4); 
        scheduler.setThreadNamePrefix("google-api-");
        scheduler.initialize();
        return scheduler;
    }
}