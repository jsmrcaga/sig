<h1 align="center">@control/sign</h1>

This is a _very_ simple utility to sign or encrypt files or random input with an RSA key pair.

Signing with a keypair allows you to broadcast your public key and transmit digital signatures so other people
can trust whatever content you sent was not tampered with.

Encrypting is used the other way around, you are supposed to encrypt a file using someone else's public key, so
they can decrypt it using their private key.
Since RSA cannot encrypt too much data, this package creates a random 32 char password that it uses to perform the encryption.
This password is then encrypted via RSA and sent along with the encrypted file.
Anyone else who receives the file should need the receipients private RSA key to decrypt the password, and thus the file.

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
| `-k, --key` | No | `~/.ssh/id_rsa` for private keys, `~/.ssh/id_rsa.pub.pem` for pubic keys | The public key used to verify, or private key used to sign |
| `-f, --format` | No | 'base64' | The format used to export the signature |

### Signing

Signing input:

```sh
sign -i <my input>
```

Signing a file:
```sh
sign my_file.ext
```

exporting :
```sh
sign -o my.signature my_file.ext
```

### Verifying

```sh
verify -s <signature.file> file-to-verify.ext
```


### Encrypting
```sh
encrypt -o file.encrypted -k bobs-public-key.pem file.txt
```

### Decrypting
```sh
decrypt file.encrypted
```

To a file
```sh
decrypt -o file.txt file.encrypted
```

```sh
decrypt file.encrypted > file.txt
```
