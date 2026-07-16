package expo.modules.operatordevicecommand

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.Signature
import java.util.UUID

internal class DeviceIdentity(private val context: Context) {
  private val prefs = context.getSharedPreferences("operator-device-command", Context.MODE_PRIVATE)
  private val alias = "operator-device-command-signing"

  fun deviceId(): String {
    val existing = prefs.getString("device-id", null)
    if (existing != null) return existing
    val value = UUID.randomUUID().toString().lowercase()
    prefs.edit().putString("device-id", value).apply()
    return value
  }

  fun deviceKeyId(): String = MessageDigest.getInstance("SHA-256")
    .digest(keyPair().public.encoded)
    .joinToString("") { "%02x".format(it) }

  fun sign(payload: ByteArray): ByteArray {
    val signer = Signature.getInstance("SHA256withECDSA")
    signer.initSign(keyPair().private)
    signer.update(payload)
    return signer.sign()
  }

  private fun keyPair(): java.security.KeyPair {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val privateKey = keyStore.getKey(alias, null) as? java.security.PrivateKey
    val certificate = keyStore.getCertificate(alias)
    if (privateKey != null && certificate != null) return java.security.KeyPair(certificate.publicKey, privateKey)

    val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore")
    generator.initialize(
      KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY)
        .setAlgorithmParameterSpec(java.security.spec.ECGenParameterSpec("secp256r1"))
        .setDigests(KeyProperties.DIGEST_SHA256)
        .build()
    )
    return generator.generateKeyPair()
  }
}
