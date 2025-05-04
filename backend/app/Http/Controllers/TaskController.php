use Illuminate\Http\Request;

<?php

namespace App\Http\Controllers;


class TaskController extends Controller
{
  public function home()
  {
    return view('home');
  }
}

?>