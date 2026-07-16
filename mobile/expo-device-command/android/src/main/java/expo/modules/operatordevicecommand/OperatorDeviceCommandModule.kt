package expo.modules.operatordevicecommand

import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.util.UUID

class OperatorDeviceCommandModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("OperatorDeviceCommand")

    AsyncFunction("getDeviceId") {
      identity().deviceId()
    }

    AsyncFunction("verifyExecutionLease") { input: Map<String, Any> ->
      val expiresAt = (input["expiresAtEpochMs"] as Number).toLong()
      require(expiresAt > System.currentTimeMillis()) { "lease_expired" }
      val expectedDeviceId = input["expectedDeviceId"] as String
      require(expectedDeviceId == identity().deviceId()) { "wrong_device" }

      val payload = (input["canonicalPayload"] as String).toByteArray(Charsets.UTF_8)
      val signatureBytes = Base64.decode(input["signatureBase64"] as String, Base64.DEFAULT)
      val publicKeyBytes = Base64.decode(input["serverPublicKeyBase64"] as String, Base64.DEFAULT)
      val publicKey = KeyFactory.getInstance("EC").generatePublic(X509EncodedKeySpec(publicKeyBytes))
      val verifier = Signature.getInstance("SHA256withECDSA")
      verifier.initVerify(publicKey)
      verifier.update(payload)
      require(verifier.verify(signatureBytes)) { "invalid_signature" }

      mapOf(
        "verified" to true,
        "deviceId" to identity().deviceId(),
        "verifiedAtEpochMs" to System.currentTimeMillis()
      )
    }

    AsyncFunction("signAcknowledgement") { canonicalAcknowledgement: String ->
      val signature = identity().sign(canonicalAcknowledgement.toByteArray(Charsets.UTF_8))
      mapOf(
        "deviceId" to identity().deviceId(),
        "deviceKeyId" to identity().deviceKeyId(),
        "challengeSignatureBase64" to Base64.encodeToString(signature, Base64.NO_WRAP),
        "attestationReference" to null
      )
    }
  }

  private fun identity(): DeviceIdentity = DeviceIdentity(appContext.reactContext!!)
}
