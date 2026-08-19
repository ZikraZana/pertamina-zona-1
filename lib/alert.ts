import Swal from "sweetalert2";

export async function confirmDelete(message: string = "Data ini akan dihapus secara permanen."): Promise<boolean> {
    const result = await Swal.fire({
        title: "Yakin hapus?",
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
    });
    return result.isConfirmed;
}

export async function confirmAction(title: string, message: string, confirmText: string = "Ya"): Promise<boolean> {
    const result = await Swal.fire({
        title,
        text: message,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Batal",
        confirmButtonColor: "#1e3a8a",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
    });
    return result.isConfirmed;
}

export function toastSuccess(message: string = "Data berhasil disimpan.") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
}

export function toastError(message: string = "Terjadi kesalahan.") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
}