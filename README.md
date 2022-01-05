# @control/sign

This is a _very_ simple utility to sign files or random input with an RSA key pair.

Signing with a keypair allows you to broadcast your public key and transmit digital signatures so other people
can trust whatever content you sent was not tampered with.

## Keys
By default @control/sign uses your default `id_rsa` key from your `.ssh` folder. You can of course specify any other key if needed.

Please note that the keys (both private and public) must be in `pem` format.

Usually your public RSA key would be generated for SSH, and should be in `ssh-rsa` format.

In order to export your public RSA key into `pem` format you can use the following command:

```sh
ssh-keygen -f my_key.pub -e -m pem > my_key.pub.pem
```

## GitHub sharing keys

GitHub automatically shares your public keys with the world, just head over to github.com/:username.keys, for example my public key is located at [github.com/jsmrcaga.keys](https://github.com/jsmrcaga.keys).

## Usage

### Installation
```sh
npm i -g @control/sign
```

### Common arguments

| Argument | Required | Default value | Description |
|:-:|:-:|:-:|:-:|
| `-i, --input` | No | - | The input to sign/verify |
| `--alg, --algorithm` | No | `RSA-SHA256` | The algorithm used to sign/verify the input |
| `-k, --key` | No | `~/.ssh/id_rsa` for private keys, `~/.ssh/id_rsa.pub.pem` for pubic keys | The public key used to verify, or private key used to sign |
| `-f, --format` | No | 'base64' | The format used to export the signature |

### Signing

Signing input:

```sh
control-sign -i <my input>
```

Signing a file:
```sh
control-sign my_file.ext
```

exporting :
```sh
control-sign -o my.signature my_file.ext
```

### Verifying

Explicit signature:
```sh
control-verify -s <signature> file-to-verify.ext
```

File signature signature:
```sh
control-verify file-to-verify.ext signature.sign
```
