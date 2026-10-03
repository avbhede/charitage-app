<?php
// backend-php/config/database.php

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/config.php';
            $db = $config['db'];

            $host = $db['host'];
            $port = $db['port'];
            $dbname = $db['database'];
            $user = $db['username'];
            $pass = $db['password'];

            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$pdo = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // If database does not exist, try creating it
                if ($e->getCode() == 1049) {
                    try {
                        $tempDsn = "mysql:host=$host;port=$port;charset=utf8mb4";
                        $tempPdo = new PDO($tempDsn, $user, $pass, $options);
                        $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                        self::$pdo = new PDO($dsn, $user, $pass, $options);

                        // Run schema.sql if tables are not initialized
                        self::initSchema(self::$pdo);
                    } catch (PDOException $ex) {
                        throw new Exception("Database connection failed: " . $ex->getMessage());
                    }
                } else {
                    throw new Exception("Database connection failed: " . $e->getMessage());
                }
            }
        }
        return self::$pdo;
    }

    public static function initSchema(PDO $pdo): void {
        $schemaFile = __DIR__ . '/../schema.sql';
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $pdo->exec($sql);
        }
        $seedFile = __DIR__ . '/../seed.sql';
        if (file_exists($seedFile)) {
            $sql = file_get_contents($seedFile);
            $pdo->exec($sql);
        }
    }
}
