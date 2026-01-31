import json
import os
import errno
import stat
import subprocess
import tempfile

from django.http import HttpResponse
from django.utils.encoding import force_bytes
from threading import Timer
from contextlib import contextmanager


class JsonResponse(HttpResponse):
    def __init__(self, content=None, cookies=None, status=200):
        if cookies is None:
            cookies = {}

        super().__init__(
            content=json.dumps(content),
            content_type="application/json",
            status=status,
        )

        for key, value in cookies.items():
            if not value:
                self.delete_cookie(key)
            else:
                self.set_cookie(key, value)


def safe_makedirs(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def run_process(cmd, timeout=5.0, stderr=None):
    """Spawns a process with a hard deadline.

    After timeout seconds the process is brutally killed. Standard error is ignored.
    """
    # As a convenience we force everything to be UTF-8
    cmd = list(map(force_bytes, cmd))

    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=stderr)

    def kill(p):
        return p.kill()

    tout = Timer(timeout, kill, [process])

    try:
        tout.start()
        output, unused_err = process.communicate()
    finally:
        tout.cancel()

    retcode = process.poll()
    if retcode:
        raise subprocess.CalledProcessError(retcode, cmd, output=output)

    return output.decode("utf-8")


@contextmanager
def atomic_file(abs_path, timestamp=None):
    """Provides a temporary file that will be moved to abs_path on context exit."""
    base, ext = os.path.splitext(abs_path)

    fd, tmp_path = tempfile.mkstemp(suffix=ext, prefix="os-atomic-")
    os.close(fd)

    f = open(tmp_path, "wb+")
    try:
        yield f
    except:
        os.remove(tmp_path)
        raise
    finally:
        f.close()

    os.chmod(
        tmp_path,
        stat.S_IRUSR
        | stat.S_IWUSR
        | stat.S_IRGRP
        | stat.S_IWGRP
        | stat.S_IROTH
        | stat.S_IWOTH,
    )
    if timestamp:
        os.utime(tmp_path, (timestamp, timestamp))

    safe_makedirs(os.path.dirname(abs_path))
    os.rename(tmp_path, abs_path)
