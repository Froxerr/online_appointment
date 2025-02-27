<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\PatientPriority;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class AddresseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonData = $this->getDecode("addresses");

        foreach ($jsonData as $data)
        {
            Address::create([
                'address_district_id' => $data->address_district_id,
                'address_name' => $data->address_name,
                'address_neighborhood' => $data->address_neighborhood,
                'address_zip' => $data->address_zip,
            ]);
        }
    }

    public function getDecode(string $rote): array
    {
        $jsonPath = database_path('data/'.$rote.'.json');
        $prioritiesJson = file_get_contents($jsonPath);
        // JSON verisini çözümleyin, diziler olarak almak için ikinci parametreyi true yapın
        $decodedData = json_decode($prioritiesJson);

        // JSON hatasını kontrol et
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON çözümleme hatası: ' . json_last_error_msg());
        }

        return $decodedData;
    }
}
