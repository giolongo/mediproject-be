import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY')!;
        this.bucketName = this.configService.get<string>('SUPABASE_BUCKET', 'products');

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async uploadFile(file: Express.Multer.File, productId: number): Promise<string> {
        console.log(`Starting upload for product ${productId}, file: ${file.originalname}`);
        console.log(`Bucket: ${this.bucketName}`);

        // For debugging: check if bucket exists
        const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets();
        if (bucketError) {
            console.error('Error listing buckets:', bucketError);
        } else {
            console.log('Available buckets:', buckets.map(b => b.name));
            const bucketExists = buckets.some(b => b.name === this.bucketName);
            if (!bucketExists) {
                console.error(`BUCKET NOT FOUND: ${this.bucketName}. Please create it in Supabase dashboard.`);
                throw new Error(`Bucket "${this.bucketName}" does not exist in Supabase.`);
            }
        }

        if (!file.buffer) {
            console.error('File buffer is missing! Check Multer configuration.');
            throw new Error('Internal Server Error: File buffer is missing');
        }

        const fileName = `${productId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        console.log(`Uploading to: ${fileName}`);

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            console.error('Supabase Storage Error Details:', JSON.stringify(error, null, 2));
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    }

    async deleteFile(filePath: string): Promise<void> {
        // Extract the file path from the full URL
        const fileName = filePath.split(`${this.bucketName}/`)[1];

        if (fileName) {
            await this.supabase.storage
                .from(this.bucketName)
                .remove([fileName]);
        }
    }
}
