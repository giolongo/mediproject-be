import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    try {
        // Create a test user
        const user = await authService.createUser('testuser', 'password123');
        console.log('✅ Test user created successfully!');
        console.log('Username:', user.username);
        console.log('Password: password123');
        console.log('\nYou can now use these credentials to login via /auth/login');
    } catch (error) {
        if (error.code === '23505') {
            console.log('ℹ️  Test user already exists');
            console.log('Username: testuser');
            console.log('Password: password123');
        } else {
            console.error('❌ Error creating user:', error.message);
        }
    }

    await app.close();
}

bootstrap();
