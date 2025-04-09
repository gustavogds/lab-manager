from hashids import Hashids

INODE = 1
CONTENT = INODE
USER = 2
ORGANIZATION = 3
FOLDER = 4
MOUNT = 5
POST = 6

_hashids = Hashids(salt="lifepets")


def encode(*values, **kwargs):
    return _hashids.encode(*values)


def decode(value, cat=None):
    decoded = _hashids.decode(value)

    if decoded:
        if len(decoded) < 2:
            return

        if cat is not None and decoded[0] != cat:
            return

        if len(decoded) == 2:
            return decoded[1]

        return decoded[1:]
